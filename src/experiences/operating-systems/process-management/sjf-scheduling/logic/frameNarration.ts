import type { Process } from '../../workloads'
import type { SchedulingFrame } from '../../schedule'
import { pluralUnits } from '../../schedule'

/*
 * Frames to sentences for the SJF page. Kept out of the component file because
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
        return `${frame.processId} arrives, but the CPU is not preempted: ${frame.running.id} keeps running with ${
          left
        } more ${pluralUnits(left)} left, and ${
          waiting === 1 ? '1 process is' : `${waiting} processes are`
        } waiting.`
      }
      if (waiting > 1) {
        return `${frame.processId} arrives and the CPU is free: the shortest burst of the ${waiting} processes waiting will run next.`
      }
      return `${frame.processId} arrives and finds the CPU free.`
    }
    case 'run': {
      const left = frame.running ? frame.running.unitsLeft : 1
      const process = processes.find((candidate) => candidate.id === frame.processId)
      if (process && frame.running && frame.running.unitsLeft === process.burst) {
        // First unit of this burst, so this is the dispatch frame. The queue in
        // a run frame is already the post-dispatch one, so its length counts the
        // processes this one was chosen over - the choice was between them plus
        // it. A completed process never re-enters, so this stays one block.
        const beaten = frame.queue.length
        const burst = `${process.burst} ${pluralUnits(process.burst)} of burst`
        if (beaten === 0) {
          return `${frame.processId} runs its ${burst} — the only process waiting when the CPU came free.`
        }
        return `${frame.processId} runs its ${burst} — the shortest burst of the ${
          beaten + 1
        } waiting, with ${beaten === 1 ? '1 process' : `${beaten} processes`} queued behind it.`
      }
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
      // Never name the next process here. A complete frame sits at the finish
      // instant, and the dispatch happens at the start of the next unit, after
      // that unit's arrivals - so a process arriving then can still win. On the
      // starvation preset P1 completes with only P2 queued, and P3 takes the CPU
      // anyway. FCFS can name the successor because its queue order decides; SJF
      // has to state the rule and let the dispatch frame name the winner.
      return `${frame.processId} finished at t=${frame.time}.${metrics}${
        frame.queue.length > 0
          ? ' The CPU is free: the next process to run is the shortest burst among those waiting.'
          : ' The CPU is free and no process is waiting.'
      }`
    }
    case 'preempt':
      // SJF dispatches only when the CPU is free, so this frame cannot come from
      // its generator. The case exists because the frame type is shared with the
      // preemptive policy; failing loudly keeps that sharing honest.
      throw new Error(`SJF cannot produce a preempt frame at t=${frame.time}`)
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
