export type MuuriCtor = new (element: Element, options?: unknown) => any;

export async function loadMuuri(): Promise<MuuriCtor> {
    const mod = await import('muuri');
    return (mod as unknown as { default: MuuriCtor }).default;
}
