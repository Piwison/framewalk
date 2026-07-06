import { describe, expect, it } from "vitest";
import { roman } from "./roman";

describe("roman", () => {
  it("renders the small numbers plates actually use", () => {
    expect(roman(1)).toBe("I");
    expect(roman(4)).toBe("IV");
    expect(roman(7)).toBe("VII");
    expect(roman(9)).toBe("IX");
    expect(roman(12)).toBe("XII");
    expect(roman(14)).toBe("XIV");
    expect(roman(40)).toBe("XL");
    expect(roman(99)).toBe("XCIX");
  });

  it("keeps working if a diary grows large", () => {
    expect(roman(1987)).toBe("MCMLXXXVII");
    expect(roman(3999)).toBe("MMMCMXCIX");
  });

  it("meets nonsense kindly", () => {
    expect(roman(0)).toBe("—");
    expect(roman(-3)).toBe("—");
    expect(roman(Number.NaN)).toBe("—");
    expect(roman(2.9)).toBe("II");
  });
});
