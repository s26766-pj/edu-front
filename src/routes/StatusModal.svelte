<script lang="ts">
    import { Progressbar } from "flowbite-svelte";
    import { onMount, onDestroy } from 'svelte';
    import { sineOut } from 'svelte/easing';
    
    interface Props {
        onCancel: () => void;
        status: string;
        solverTimeLimit?: number;
    }
    
    let { onCancel, status, solverTimeLimit = 1 }: Props = $props();
    
    let startTime: number;
    let progress = $state(0);
    let elapsedTime = $state(0);
    let progressInterval: number | null = null;
    
    // Calculate total time with 30s buffer (in seconds)
    let totalTimeSeconds = $derived((solverTimeLimit * 60) + 30);
    
    // Format elapsed time as MM:SS
    let formattedElapsedTime = $derived(`${Math.floor(elapsedTime / 60)}:${(elapsedTime % 60).toString().padStart(2, '0')}`);
    let formattedTotalTime = $derived(`${Math.floor(totalTimeSeconds / 60)}:${(totalTimeSeconds % 60).toString().padStart(2, '0')}`);
    
    onMount(() => {
        if (status === 'SOLVING_ACTIVE') {
            startTime = Date.now();
            
            // Update progress every second
            progressInterval = setInterval(() => {
                const now = Date.now();
                elapsedTime = Math.floor((now - startTime) / 1000);
                progress = Math.min((elapsedTime / totalTimeSeconds) * 100, 100);
            }, 1000);
        }
    });
    
    onDestroy(() => {
        if (progressInterval) {
            clearInterval(progressInterval);
        }
    });
    
    // Clean up interval when status changes to not solving
    $effect(() => {
        if (status !== 'SOLVING_ACTIVE' && progressInterval) {
            clearInterval(progressInterval);
            progressInterval = null;
        }
    });
</script>

{#if status === 'SOLVING_ACTIVE'}
    <div class="modal-overlay">
        <div class="modal">
            <h3>⏳ Solving Timetable...</h3>
            
            <div class="progress-section">
                <div class="time-info">
                    <span>{formattedElapsedTime} / {formattedTotalTime}</span>
                </div>
                
                <div class="custom-progress-container">
                    <div class="custom-progress-label">Solving Progress</div>
                    <div class="custom-progress-bar">
                        <div 
                            class="custom-progress-fill" 
                            style="width: {progress}%"
                        >
                            <span class="custom-progress-text">{progress.toFixed(1)}%</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <button onclick={onCancel}>❌ Cancel</button>
        </div>
    </div>
{/if}

<style>
    .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
    }

    .modal {
        background: white;
        padding: 2rem;
        border-radius: 1rem;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
        text-align: center;
        width: 90%;
        max-width: 400px;
    }
    .modal button {
        margin-top: 1rem;
        padding: 0.5rem 1rem;
        border: none;
        border-radius: 0.5rem;
        background-color: #e74c3c;
        color: white;
        cursor: pointer;
        font-weight: bold;
    }
    .modal button:hover {
        background-color: #c0392b;
    }
    
    .progress-section {
        margin: 1.5rem 0;
    }
    
    .time-info {
        margin-bottom: 0.5rem;
        font-size: 0.9rem;
        color: #666;
        font-family: monospace;
    }
    
    .custom-progress-container {
        width: 100%;
        margin: 1rem 0;
    }
    
    .custom-progress-label {
        font-size: 0.9rem;
        color: #333;
        margin-bottom: 0.5rem;
        font-weight: 500;
    }
    
    .custom-progress-bar {
        width: 100%;
        height: 24px;
        background-color: #f3f4f6;
        border-radius: 12px;
        overflow: hidden;
        position: relative;
        border: 1px solid #e5e7eb;
    }
    
    .custom-progress-fill {
        height: 100%;
        background-color: #dc2626;
        border-radius: 12px;
        transition: width 0.3s ease-in-out;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        min-width: 60px; /* Ensure text is always visible */
    }
    
    .custom-progress-text {
        color: white;
        font-size: 0.8rem;
        font-weight: 600;
        text-shadow: 0 1px 2px rgba(0,0,0,0.3);
    }
</style>
