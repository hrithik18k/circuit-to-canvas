import type { PcbTraceRoutePointWire } from "circuit-json"
import { normalizeTraceDirection } from "./normalize-trace-direction"

/** Intersect finite inside edges; bevel outside joins rather than extending miters. */
export function getTraceEdgeJoin({
  previous,
  point,
  next,
  side,
}: {
  previous: PcbTraceRoutePointWire
  point: PcbTraceRoutePointWire
  next: PcbTraceRoutePointWire
  side: number
}): Array<{ x: number; y: number }> | null {
  const incoming = normalizeTraceDirection(
    point.x - previous.x,
    point.y - previous.y,
  )
  const outgoing = normalizeTraceDirection(next.x - point.x, next.y - point.y)
  if (
    (incoming.x === 0 && incoming.y === 0) ||
    (outgoing.x === 0 && outgoing.y === 0)
  )
    return null
  const incomingStart = {
    x: previous.x - ((incoming.y * previous.width) / 2) * side,
    y: previous.y + ((incoming.x * previous.width) / 2) * side,
  }
  const incomingEnd = {
    x: point.x - ((incoming.y * point.width) / 2) * side,
    y: point.y + ((incoming.x * point.width) / 2) * side,
  }
  const outgoingStart = {
    x: point.x - ((outgoing.y * point.width) / 2) * side,
    y: point.y + ((outgoing.x * point.width) / 2) * side,
  }
  const outgoingEnd = {
    x: next.x - ((outgoing.y * next.width) / 2) * side,
    y: next.y + ((outgoing.x * next.width) / 2) * side,
  }
  const incomingEdge = {
    x: incomingEnd.x - incomingStart.x,
    y: incomingEnd.y - incomingStart.y,
  }
  const outgoingEdge = {
    x: outgoingEnd.x - outgoingStart.x,
    y: outgoingEnd.y - outgoingStart.y,
  }
  if (incomingEnd.x === outgoingStart.x && incomingEnd.y === outgoingStart.y)
    return [incomingEnd]
  const determinant =
    incomingEdge.x * outgoingEdge.y - incomingEdge.y * outgoingEdge.x
  if (determinant === 0) return [incomingEnd, outgoingStart]
  const alongIncoming =
    ((outgoingStart.x - incomingStart.x) * outgoingEdge.y -
      (outgoingStart.y - incomingStart.y) * outgoingEdge.x) /
    determinant
  const alongOutgoing =
    ((outgoingStart.x - incomingStart.x) * incomingEdge.y -
      (outgoingStart.y - incomingStart.y) * incomingEdge.x) /
    determinant
  // Only trim edges where they actually overlap. Outside joins are bevels.
  if (
    alongIncoming < 0 ||
    alongIncoming > 1 ||
    alongOutgoing < 0 ||
    alongOutgoing > 1
  )
    // Overlapping short segments must add copper rather than cancel its winding.
    return (incoming.x * outgoing.y - incoming.y * outgoing.x) * side > 0
      ? [incomingEnd, { x: point.x, y: point.y }, outgoingStart]
      : [incomingEnd, outgoingStart]
  return [
    {
      x: incomingStart.x + alongIncoming * incomingEdge.x,
      y: incomingStart.y + alongIncoming * incomingEdge.y,
    },
  ]
}
