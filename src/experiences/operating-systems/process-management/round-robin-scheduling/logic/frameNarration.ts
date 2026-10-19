import type { Process } from '../../workloads'
import type { SchedulingFrame } from '../../schedule'
import { pluralUnits, unitsRunInGantt } from '../../schedule'

/*
 * Frames to sentences for the Round Robin page. Kept out of the component file
 * because it is the narration that carries the policy's claims - what a slice
 * costs, what a preempted process still needs - and those claims are tested
 * here, without a React tree in the way.
 */

function processById(processes: Process[], id: string | null): Process | undefined {
  return processes.find((candidate) => candidate.id === id)
}

// A preempted process has no running snapshot to read, so what it still needs is
// its burst minus the units the Gantt already shows it having run.
function burstLeftAfterPreemption(frame: SchedulingFrame, process: Process): number {
  return process.burst - unitsRunInGantt(frame, process.id)
}

// True when the cell just added to the Gantt opens a fresh grant of the CPU,
// which is what a slice is. Only a `run` frame asks this, so the row length is
// the current unit's index.
function startsSlice(frame: SchedulingFrame): boolean {
  return frame.sliceStarts[frame.cells.length - 1] === true
}

export function describeFrame(
  frame: SchedulingFrame,
  processes: Process[],
  quantum: number,
  preemptions: number,
): string {
  switch (frame.kind) {
    case 'ready':
      return `Ready to schedule ${processes.length} processes with a quantum of ${quantum} ${pluralUnits(quantum)}.`
    case 'arrive': {
      const waiting = frame.queue.length
      if (frame.running) {
        return `${frame.processId} joins the ready queue; ${frame.running.id} keeps the CPU for the rest of its slice, and ${
          waiting === 1 ? '1 process is' : `${waiting} processes are`
        } waiting.`
      }
      if (waiting > 1) {
        return `${frame.processId} arrives and the CPU is free: the process at the head of the queue of ${waiting} takes it next.`
      }
      return `${frame.processId} arrives and finds the CPU free.`
    }
    case 'run': {
      const running = frame.running
      const process = processById(processes, frame.processId)
      if (!running || !process) {
        return `${frame.processId} runs on the CPU.`
      }
      const left = running.unitsLeft
      if (startsSlice(frame)) {
        // The first cell of a slice. Whether this is the process's first slice
        // ever is read off the burst it has already spent, not off a counter the
        // view would have to keep.
        const spentBefore = process.burst - left
        if (spentBefore === 0) {
          return `${frame.processId} takes the CPU for the first time, after waiting ${
            running.waiting
          } ${pluralUnits(running.waiting)}. Its slice is up to ${quantum} ${pluralUnits(
            quantum,
          )}.`
        }
        return `${frame.processId} gets the CPU back for another slice of up to ${quantum} ${pluralUnits(
          quantum,
        )}, with ${left} ${pluralUnits(left)} of burst left and ${
          running.waiting
        } ${pluralUnits(running.waiting)} already waited.`
      }
      if (left === 1) {
        return `${frame.processId} runs its last unit of burst.`
      }
      return `${frame.processId} runs within its slice — ${left} ${pluralUnits(
        left,
      )} of its burst left.`
    }
    case 'idle':
      return 'The CPU is idle: the ready queue is empty and the next process has not arrived yet.'
    case 'complete': {
      const finished = frame.completed.find(
        (process) => process.id === frame.processId,
      )
      if (!finished) {
        return `${frame.processId} finished at t=${frame.time}.`
      }
      return `${frame.processId} finished at t=${frame.time}: it waited ${
        finished.waiting
      } ${pluralUnits(finished.waiting)} in total, ${
        finished.response
      } of them before its first slice, and its turnaround is ${finished.turnaround}.${
        frame.queue.length > 0
          ? ' The CPU is free: the head of the ready queue takes it next.'
          : ' The CPU is free and no process is waiting.'
      }`
    }
    case 'preempt': {
      const process = processById(processes, frame.processId)
      const left = process ? burstLeftAfterPreemption(frame, process) : 0
      const ahead = frame.queue.length - 1
      return `${frame.processId}'s slice is over. It still needs ${left} ${pluralUnits(
        left,
      )} of burst and goes to the back of the ready queue${
        ahead === 0
          ? ', where it is the only process waiting.'
          : `, behind the ${ahead} ${
              ahead === 1 ? 'process' : 'processes'
            } already queued.`
      }`
    }
    case 'done': {
      const total = frame.completed.length
      const average = (pick: (process: { waiting: number; response: number }) => number) =>
        total > 0
          ? (
              frame.completed.reduce((sum, process) => sum + pick(process), 0) / total
            ).toFixed(1)
          : '0'
      return `All ${total} processes finished in ${frame.time} ${pluralUnits(
        frame.time,
      )}. Average waiting ${average((process) => process.waiting)}, average response ${average(
        (process) => process.response,
      )}, and the CPU was handed back ${preemptions} ${
        preemptions === 1 ? 'time' : 'times'
      }.`
    }
  }
}
