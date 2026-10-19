import type { Process } from '../../workloads'
import type { SchedulingFrame } from '../../schedule'
import { pluralUnits } from '../../schedule'

/*
 * Frames to sentences for the FCFS page. Kept out of the component file because
 * it is the narration that carries the policy's claims, and because the lint rule
 * for fast refresh (react-refresh/only-export-components) forbids exporting a
 * helper from the file that exports the page. Living here makes every sentence the
 * reader sees part of the committed snapshot.
 */

export function describeFrame(frame: SchedulingFrame, processes: Process[]): string {
  switch (frame.kind) {
    case 'ready':
      return `Ready to schedule ${processes.length} processes.`
    case 'arrive': {
      const waiting = frame.queue.length
      if (frame.running) {
        const left = frame.running.unitsLeft
        return `${frame.processId} arrives. ${frame.running.id} keeps the CPU with ${left} more ${pluralUnits(
          left,
        )} to run, so it joins ${waiting === 1 ? '1 process' : `${waiting} processes`} waiting.`
      }
      if (waiting > 1) {
        return `${frame.processId} arrives and queues behind ${frame.queue[0]}.`
      }
      return `${frame.processId} arrives and finds the CPU free.`
    }
    case 'run': {
      const left = frame.running ? frame.running.unitsLeft : 1
      return left === 1
        ? `${frame.processId} runs its last burst unit.`
        : `${frame.processId} runs on the CPU — ${left} units of its burst left.`
    }
    case 'idle':
      return 'The CPU is idle: the ready queue is empty and the next process has not arrived yet.'
    case 'complete': {
      const finished = frame.completed.find(
        (process) => process.id === frame.processId,
      )
      const metrics = finished
        ? ` waited ${finished.waiting} and finished with a turnaround of ${finished.turnaround}.`
        : '.'
      const nextId = frame.queue[0]
      return `${frame.processId} finished at t=${frame.time}.${metrics}${
        nextId ? ` ${nextId} is next in the queue.` : ''
      }`
    }
    case 'preempt':
      // FCFS never takes the CPU back, so this frame cannot come from its
      // generator. The case exists because the frame type is shared with the
      // preemptive policy; failing loudly keeps that sharing honest instead of
      // inventing a sentence for a state that cannot happen.
      throw new Error(`FCFS cannot produce a preempt frame at t=${frame.time}`)
    case 'done': {
      const total = frame.completed.reduce(
        (sum, process) => sum + process.waiting,
        0,
      )
      const average = frame.completed.length > 0
        ? (total / frame.completed.length).toFixed(1)
        : '0'
      return `All ${frame.completed.length} processes finished in ${frame.time} units. Average waiting time: ${average}.`
    }
  }
}
