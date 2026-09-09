# Writing into a label that has children

`element.textContent = 'x'` replaces every child node, not just the text.
When a label carries a nested hint element, assigning textContent silently
deletes it.

That is what broke the Partner TCV row. Its label is

    <label>Partner TCV <small id="pinHint"></small></label>

and the tax-inclusive rename ran

    lblPT.textContent = 'Partner TCV';

which removed `#pinHint` from the document. The next render looked it up and
got null:

    Uncaught TypeError: Cannot set properties of null (setting 'textContent')

Labels are now updated through a helper that writes only the first text node
and leaves the children alone.

## Why the validator did not catch it

`scripts/validate.mjs` checks that every literal `$('id')` resolves to an id
present in the markup. `pinHint` is present in the markup — it is removed at
runtime, after the page has loaded. Static checking cannot see that.

The lesson for new hints: an id nested inside a label is only safe while
nothing assigns to that label's textContent. Several hints already live in
labels this way (`termHint`, `endHint`, `invHint`, `payHint`, `vacvHint`) and
are fine because their labels are never rewritten. Before adding another,
check whether the surrounding label is written to anywhere.
