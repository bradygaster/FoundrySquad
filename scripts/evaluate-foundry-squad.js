'use strict';

const NEGATIONS = new Set(['no', 'not', 'never', 'without', 'cannot']);

const SUPPORT_BEFORE = /(?:recommend(?:ed|ing)?|choos(?:e|ing)|select(?:ed|ing)?|prefer(?:red|ring)?|adopt(?:ed|ing)?|us(?:e|ing)|try|deploy(?:ed|ing)?|creat(?:e|ing)|build(?:ing)?|start with|begin with|go with|evaluat(?:e|ing)|consider(?:ed|ing)?)(?: \w+){0,5}$/;
const SUPPORT_AFTER = /^(?:(?:is|are|was|were|would be|remains?) )?(?:the )?(?:recommended|appropriate|suitable|best|right|preferred|simplest|smallest|enough|good fit|better fit|right starting point|best starting point)\b|^(?:should|must) be (?:used|selected|chosen|evaluated|considered)\b/;
const REJECT_BEFORE = /(?:(?:do not|should not|must not|cannot|never)(?: \w+){0,3} (?:use|choose|select|recommend|evaluate|consider|adopt|deploy|create|build|start|begin)(?: \w+){0,3}|(?:no|not)(?: a| an| the)?|(?:avoid|reject|skip|oppose|discard|rule out|instead of|rather than)(?: \w+){0,5})$/;
const REJECT_AFTER = /^(?:(?:is|are|was|were|would be) )?(?:not recommended|not appropriate|not suitable|unnecessary|overkill|wrong|poor fit|bad fit|unsuitable)\b|^should not be (?:used|selected|chosen|recommended|evaluated|considered)\b|^(?:adds|add) no value\b/;

function normalize(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[’']/g, "'")
    .replace(/\bcan't\b/g, 'cannot')
    .replace(/\bwon't\b/g, 'will not')
    .replace(/\b(\w+)n't\b/g, '$1 not')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function signalOccurrences(text, phrase) {
  const normalizedText = normalize(text);
  const normalizedPhrase = normalize(phrase);
  if (!normalizedPhrase) return [];
  const occurrences = [];
  let offset = 0;
  while (offset < normalizedText.length) {
    const index = normalizedText.indexOf(normalizedPhrase, offset);
    if (index < 0) break;
    const before = normalizedText.slice(0, index).trim().split(' ').slice(-4);
    occurrences.push({ index, negated: before.some((token) => NEGATIONS.has(token)) });
    offset = index + normalizedPhrase.length;
  }
  return occurrences;
}

function isNegated(text, phrase) {
  const occurrences = signalOccurrences(text, phrase);
  return occurrences.length > 0 && occurrences.every((occurrence) => occurrence.negated);
}

function matchSignal(text, signal) {
  const occurrences = signalOccurrences(text, signal);
  return {
    matched: occurrences.length > 0,
    positive: occurrences.some((occurrence) => !occurrence.negated),
    negative: occurrences.some((occurrence) => occurrence.negated),
    negated: occurrences.length > 0 && occurrences.every((occurrence) => occurrence.negated)
  };
}

function stanceClauses(text) {
  return String(text || '')
    .split(/[.;!?\n]+|\b(?:but|however|although|yet)\b/iu)
    .map(normalize)
    .filter(Boolean);
}

function classifyTargetInClause(clause, target) {
  const targetWords = normalize(target).split(' ').filter(Boolean);
  const words = clause.split(' ').filter(Boolean);
  const result = { support: false, reject: false };
  if (!targetWords.length) return result;
  for (let index = 0; index <= words.length - targetWords.length; index += 1) {
    if (!targetWords.every((word, offset) => words[index + offset] === word)) continue;
    const before = words.slice(Math.max(0, index - 10), index).join(' ');
    const after = words.slice(index + targetWords.length, index + targetWords.length + 10).join(' ');
    const negatedRejection = /(?:do not|should not|must not|never) (?:reject|avoid|skip|rule out)$/.test(before);
    const reject = !negatedRejection && (REJECT_BEFORE.test(before) || REJECT_AFTER.test(after));
    result.reject ||= reject;
    result.support ||= !reject && (SUPPORT_BEFORE.test(before) || SUPPORT_AFTER.test(after));
  }
  return result;
}

function evaluateStance(text, stance) {
  const observed = { support: false, reject: false };
  for (const clause of stanceClauses(text)) {
    for (const target of stance.targets || []) {
      const classified = classifyTargetInClause(clause, target);
      observed.support ||= classified.support;
      observed.reject ||= classified.reject;
    }
  }
  return {
    name: stance.name,
    polarity: stance.polarity,
    targets: stance.targets,
    observed,
    matched: Boolean(observed[stance.polarity])
  };
}

function evidenceScore(text, evidence = {}) {
  const normalized = normalize(text);
  const markers = [
    /subscription/.test(normalized),
    /region|location/.test(normalized),
    /quota|usage/.test(normalized),
    /capacity/.test(normalized),
    /authenticated|auth outcome|entra|arm/.test(normalized),
    /timestamp|retrieved|freshness|current/.test(normalized),
    Boolean(evidence.subscriptionSpecific),
    Boolean(evidence.availability),
    Boolean(evidence.quota),
    Boolean(evidence.capacity)
  ];
  return markers.filter(Boolean).length;
}

function evaluateResponse(scenario, response, options = {}) {
  const hardFailures = (scenario.hardFailureSignals || [])
    .filter((signal) => {
      const match = matchSignal(response, signal);
      return match.positive;
    });
  const concepts = scenario.concepts.map((concept) => {
    const matches = concept.signals.map((signal) => ({ signal, ...matchSignal(response, signal) }));
    const positive = matches.filter((match) => match.positive);
    const negated = matches.filter((match) => match.negative);
    return {
      name: concept.name,
      passed: positive.length > 0,
      matchedSignals: positive.map((match) => match.signal),
      negatedSignals: negated.map((match) => match.signal)
    };
  });
  const conceptPasses = concepts.filter((concept) => concept.passed).length;
  const score = concepts.length ? conceptPasses / concepts.length : 1;
  const evidence = evidenceScore(response, options.evidence);
  const threshold = options.evidenceThreshold ?? scenario.evidenceThreshold ?? 0;
  const requiredStances = (scenario.requiredStances || []).map((stance) => evaluateStance(response, stance));
  const forbiddenStances = (scenario.forbiddenStances || []).map((stance) => evaluateStance(response, stance));
  const missingRequiredStances = requiredStances.filter((stance) => !stance.matched);
  const violatedForbiddenStances = forbiddenStances.filter((stance) => stance.matched);
  const blockedAuth = scenario.id === 'H' && options.authenticatedRun &&
    !(options.evidence && options.evidence.subscriptionSpecific &&
      options.evidence.availability && options.evidence.quota && options.evidence.capacity);
  const passed = !blockedAuth && hardFailures.length === 0 && score === 1 && evidence >= threshold &&
    missingRequiredStances.length === 0 && violatedForbiddenStances.length === 0;
  return {
    scenario: scenario.id,
    status: blockedAuth ? 'BLOCKED_AUTH' : passed ? 'PASS' : 'FAIL',
    score,
    concepts,
    requiredStances,
    forbiddenStances,
    missingRequiredStances: missingRequiredStances.map((stance) => stance.name),
    violatedForbiddenStances: violatedForbiddenStances.map((stance) => stance.name),
    evidenceScore: evidence,
    evidenceThreshold: threshold,
    hardFailures
  };
}

module.exports = {
  classifyTargetInClause,
  evidenceScore,
  evaluateResponse,
  evaluateStance,
  isNegated,
  matchSignal,
  normalize,
  stanceClauses
};
