export function findingEntityRef(entityRef: string | null | undefined): string {
  return entityRef ?? "";
}

export function findingStatusKey(checkId: string, entityRef: string | null | undefined): string {
  return `${checkId}::${findingEntityRef(entityRef)}`;
}
