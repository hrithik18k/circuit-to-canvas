import { expect, test } from "bun:test"
import type { PcbTraceRoutePointWire } from "circuit-json"
import { buildTracePolygon } from "../lib"

test("public buildTracePolygon preserves vertex widths, bends, and input", () => {
  const points: [PcbTraceRoutePointWire, PcbTraceRoutePointWire] = [
    { route_type: "wire", x: 0, y: 0, width: 1, layer: "top" },
    { route_type: "wire", x: 4, y: 0, width: 3, layer: "top" },
  ]
  const original = structuredClone(points)
  const expected = [
    { x: 0, y: 0.5 },
    { x: 4, y: 1.5 },
    { x: 4, y: -1.5 },
    { x: 0, y: -0.5 },
  ]
  expect(buildTracePolygon(points)).toEqual(expected)
  expect(buildTracePolygon([...points].reverse())).toEqual([
    expected[2],
    expected[3],
    expected[0],
    expected[1],
  ])
  const bend = buildTracePolygon([
    points[0],
    { ...points[1], width: 2 },
    { ...points[1], y: 4 },
  ])
  expect(bend).toHaveLength(6)
  expect(bend[1]!.x).toBeCloseTo(4 - Math.SQRT1_2)
  expect(bend[1]!.y).toBeCloseTo(Math.SQRT1_2)
  expect(bend[4]!.x).toBeCloseTo(4 + Math.SQRT1_2)
  expect(bend[4]!.y).toBeCloseTo(-Math.SQRT1_2)
  expect(buildTracePolygon([])).toEqual([])
  expect(points).toEqual(original)
})
