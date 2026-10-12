export type Publication = {
  id: string;
  title: string[];
  venue: string;
  kind: string;
  identifier: { label: string; value: string };
  url: string;
  abstract: string;
  project: string;
  cite?: string;
};

export const publications: Publication[] = [
  {
    id: "rcae",
    title: ["RESERVATION CONFLICT", "ANTICIPATION ENGINE"],
    venue: "Zenodo / CERN",
    kind: "Algorithm · Research record",
    identifier: { label: "DOI", value: "10.5281/zenodo.21477811" },
    url: "https://doi.org/10.5281/zenodo.21477811",
    abstract:
      "An original algorithm for forward operational stress scoring in restaurant reservation systems. RCAE scores a proposed booking on turnover clustering, cascade risk, kitchen load and dead time, returning a composite 0–1 score.",
    project: "rcae-reservations",
    cite: "Kumar, A. V. Reservation Conflict Anticipation Engine (RCAE). Zenodo. doi:10.5281/zenodo.21477811",
  },
  {
    id: "pycodeatlas",
    title: ["PYCODEATLAS"],
    venue: "PyPI",
    kind: "Python package · Developer tool",
    identifier: { label: "PIP", value: "pip install pycodeatlas" },
    url: "https://pypi.org/project/pycodeatlas/",
    abstract:
      "A static code analysis CLI that builds dependency graphs, detects dead code via Python AST and NetworkX, and shows exactly what breaks if you delete a function or module.",
    project: "pycodeatlas",
  },
];
