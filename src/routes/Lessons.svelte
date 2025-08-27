<script lang="ts">
    import { onMount } from 'svelte';
    import type { Lesson } from '../types';
    import { loadMuuri } from '../lib/muuri.client';
    import { unassignedLessons } from '../lib/stores/appStore';

    // Use store values instead of local state
    $: lessons = $unassignedLessons;
    let loading = false;
    let error: string | null = null;

    onMount(async () => {
        // Data is loaded by DataService in parent component
        // Initialize Muuri grid after DOM is ready
        setTimeout(async () => {
            await initializeMuuriGrid();
        }, 100);
    });

    async function initializeMuuriGrid() {
        try {
            const containerEl = document.querySelector('.muuri-grid');
            if (!containerEl) {
                console.warn('Muuri container not found');
                return;
            }

            const items = containerEl.querySelectorAll('.muuri-item');
            if (items.length === 0) {
                console.warn('No Muuri items found');
                return;
            }

            console.log(`Initializing Muuri grid with ${items.length} items`);
            
            const Muuri = await loadMuuri();
            const grid = new Muuri(containerEl, {
                items: '.muuri-item',
                layoutDuration: 400,
                layoutEasing: 'ease',
                dragEnabled: true,
                dragContainer: document.body,
                dragSortHeuristics: {
                    sortInterval: 10,
                    minDragDistance: 10,
                    minBounceBackAngle: 1
                },
                layout: {
                    horizontal: false,
                    alignRight: false,
                    alignBottom: false,
                    fillGaps: true
                },
                dragSort: () => {
                    // Enable dragging between all grids
                    const grids = [grid]; // Include self
                    // Add all cell grids
                    Object.values((window as any).cellGrids || {}).forEach(cellGrid => {
                        if (cellGrid) grids.push(cellGrid);
                    });
                    return grids;
                }
            });

            // Store reference globally for cross-grid dragging
            (window as any).lessonsGrid = grid;

            // Add event listeners for drag operations
            grid.on('dragEnd', (item: any) => {
                console.log('Lesson dragged:', item.getElement().dataset.lessonId);
                // Here you could update the application state when lessons are moved
            });

            grid.on('receive', (data: any) => {
                console.log('Lesson received from another grid:', data.item.getElement().dataset.lessonId);
            });

            grid.on('send', (data: any) => {
                console.log('Lesson sent to another grid:', data.item.getElement().dataset.lessonId);
            });
            
            console.log('Muuri grid initialized successfully with cross-grid dragging');
        } catch (error) {
            console.error('Failed to initialize Muuri grid:', error);
        }
    }
</script>

<main>
    <h3>🧾 Unassigned lessons:</h3>
    {#if lessons.length === 0}
        <p>📝 No unassigned lessons</p>
    {:else}
        <div class="muuri-grid">
            {#each lessons as lesson}
                <div class="muuri-item">
                    <div class="lesson-content">
                        <strong>{lesson.subject}</strong><br>
                        {lesson.teacher?.firstName} {lesson.teacher?.lastName}<br>
                        <em>{lesson.studentGroup?.name}</em>
                    </div>
                </div>
            {/each}
        </div>
    {/if}
</main>

<style>
    .muuri-grid {
        position: relative;
        min-height: 200px;
        height: auto;
        overflow: visible;
        width: 100%;
    }

    .muuri-item {
        position: absolute;
        display: block;
        margin: 5px;
        z-index: 1;
        background: #000;
        color: white;
        border-radius: 3px;
        width: 150px;
        height: auto;
        cursor: grab;
    }


    .lesson-content {
        padding: 10px;
        font-size: 12px;
    }
</style>