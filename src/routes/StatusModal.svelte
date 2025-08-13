<script lang="ts">
    export let onCancel: () => void;
    export let status: string;
</script>

{#if status === 'SOLVING_ACTIVE'}
    <div class="modal-overlay">
        <div class="modal">
            <h3>⏳ Processing...</h3>
            <button on:click={onCancel}>❌ Cancel</button>
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
</style>
