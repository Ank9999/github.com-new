import { describe, it, expect } from "vitest";
import { BnsSearchEngine } from "../lib/searchEngine";
import { getVerifiedEntries } from "../lib/dataValidation";
import rawData from "../data/bns_sections.json";
import type { BnsSection } from "../types/legal";

const dataset = getVerifiedEntries(rawData as BnsSection[]);
const engine = new BnsSearchEngine(dataset);

function topIds(query: string, clarifications: any[] = []) {
  return engine.search(query, clarifications).map((r) => r.entry.section);
}

describe("BnsSearchEngine — plain language queries", () => {
  it("finds Theft for 'phone stolen'", () => {
    expect(topIds("phone stolen")).toContain("303");
  });

  it("finds Theft for 'someone stole my bike'", () => {
    expect(topIds("someone stole my bike")).toContain("303");
  });

  it("finds the aggravated Criminal Intimidation entry for 'person threatened to kill me'", () => {
    const ids = engine.search("person threatened to kill me").map((r) => r.entry.id);
    expect(ids).toContain("351-3");
  });

  it("finds Hurt-related provisions for Hinglish 'maar peet'", () => {
    const ids = topIds("maar peet");
    expect(ids.length).toBeGreaterThan(0);
    expect(ids).toContain("115");
  });

  it("finds Theft for Hindi/Hinglish 'chori'", () => {
    expect(topIds("chori")).toContain("303");
  });

  it("finds Cheating for 'online fraud'", () => {
    const ids = topIds("online fraud");
    expect(ids).toContain("318");
  });

  it("finds Forgery for 'forged signature'", () => {
    expect(topIds("forged signature")).toContain("336");
  });

  it("finds House-Trespass for 'broke into house'", () => {
    expect(topIds("broke into house")).toContain("331");
  });

  it("finds Mischief for 'damaged my vehicle'", () => {
    expect(topIds("damaged my vehicle")).toContain("324");
  });

  it("finds Kidnapping-for-ransom for 'kidnapped child' style queries", () => {
    const ids = topIds("kidnapped a child");
    expect(ids).toContain("137");
  });

  it("finds Grievous Hurt / Attempt to Murder for 'attacked with knife'", () => {
    const ids = topIds("attacked with knife");
    expect(ids.some((s) => s === "117" || s === "109")).toBe(true);
  });

  it("finds Attempt to Murder for 'tried to kill'", () => {
    expect(topIds("tried to kill")).toContain("109");
  });

  it("finds Rioting for 'group attacked person'", () => {
    expect(topIds("group attacked person")).toContain("191");
  });

  it("is typo-tolerant ('theeft', 'stollen')", () => {
    const ids = topIds("theeft of my phone");
    expect(ids).toContain("303");
  });

  it("returns no results for an empty query", () => {
    expect(engine.search("")).toEqual([]);
  });

  it("does not crash on a very long description", () => {
    const long = "Someone entered my house at night ".repeat(50);
    expect(() => engine.search(long)).not.toThrow();
  });

  it("does not crash on special characters", () => {
    expect(() => engine.search("!!! @@@ ### $$$ theft ???")).not.toThrow();
  });

  it("returns a MatchStrength label for every result", () => {
    const results = engine.search("someone stole my phone from my bag");
    expect(results.length).toBeGreaterThan(0);
    for (const r of results) {
      expect(["Strong match", "Possible match", "Related provision"]).toContain(r.matchStrength);
    }
  });

  it("never invents an entry id outside the dataset", () => {
    const validIds = new Set(dataset.map((d) => d.id));
    const results = engine.search("someone stole my phone and threatened to kill me");
    for (const r of results) {
      expect(validIds.has(r.entry.id)).toBe(true);
    }
  });
});

describe("BnsSearchEngine — clarification nudges", () => {
  it("boosts Murder over Attempt to Murder when the victim died", () => {
    const withDeath = engine.search("person attacked another person", [
      { questionId: "victim_died", value: "yes" },
    ]);
    const murder = withDeath.find((r) => r.entry.id === "103");
    const attempt = withDeath.find((r) => r.entry.id === "109");
    if (murder && attempt) {
      expect(murder.score).toBeGreaterThan(attempt.score);
    }
  });
});

describe("BnsSearchEngine — suggestions", () => {
  it("suggests terms for a short prefix", () => {
    const suggestions = engine.suggest("thr");
    expect(suggestions.length).toBeGreaterThan(0);
  });

  it("returns no suggestions for a 1-character query", () => {
    expect(engine.suggest("t")).toEqual([]);
  });
});
