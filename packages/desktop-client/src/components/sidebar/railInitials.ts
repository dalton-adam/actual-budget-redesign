function graphemes(value: string) {
  const segmenter = new Intl.Segmenter(undefined, { granularity: 'grapheme' });
  return Array.from(segmenter.segment(value.trim()), s => s.segment);
}

export function firstGrapheme(value: string) {
  const [first] = graphemes(value);
  return first === undefined ? '?' : first.toLocaleUpperCase();
}

function twoLetters(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  const letters =
    words.length > 1
      ? [graphemes(words[0])[0], graphemes(words[1])[0]]
      : graphemes(name).slice(0, 2);
  return letters.length === 2 && letters.every(Boolean)
    ? letters.join('').toLocaleUpperCase()
    : null;
}

/**
 * Initials for the collapsed accounts rail, in the order given. A name keeps
 * its first letter unless another name shares it; those names take the first
 * letters of their first two words (or their first two letters), and any
 * that still collide take the first letter and their position among the
 * names sharing it ("H1", "H2").
 */
export function getRailInitials(names: string[]) {
  const initials = names.map(firstGrapheme);
  const countOf = (values: Array<string | null>, value: string | null) =>
    values.filter(v => v === value).length;

  const collided = initials.map(i => countOf(initials, i) > 1);
  const pairs = names.map((name, index) =>
    collided[index] ? twoLetters(name) : null,
  );

  return initials.map((initial, index) => {
    if (!collided[index]) {
      return initial;
    }
    const pair = pairs[index];
    if (pair !== null && countOf(pairs, pair) === 1) {
      return pair;
    }
    const position = initials
      .slice(0, index + 1)
      .filter(i => i === initial).length;
    return `${initial}${position}`;
  });
}
