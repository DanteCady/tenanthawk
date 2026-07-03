import GithubSlugger from "github-slugger";

export function slugifyHeading(title: string): string {
  const slugger = new GithubSlugger();
  return slugger.slug(title);
}

export function slugifyHeadings(titles: string[]): string[] {
  const slugger = new GithubSlugger();
  return titles.map((title) => slugger.slug(title));
}
