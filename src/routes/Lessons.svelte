<script lang="ts">
	import { onMount } from 'svelte';
	import { fetchUnassignedLessonsByLocation } from '../api';
	import type { Lesson } from '../types';
	import { TEMPORARY_LOCATION_ID } from '../types';

	let lessons: Lesson[] = [];
	let loading = true;
	let error: string | null = null;

	onMount(async () => {
		try {
			lessons = await fetchUnassignedLessonsByLocation(TEMPORARY_LOCATION_ID);
			console.log('mumur fetchUnassignedLessonsByLocation: ', JSON.stringify(lessons));
		} catch (err) {
			console.log('mumur empty');
			error = err instanceof Error ? err.message : 'Unknown error';
		} finally {
			loading = false;
		}
	});
    console.log("bana mumur lessons: ", JSON.stringify(lessons));
</script>

<main>
	{#if loading}
		<p>⏳ Loading lessons...</p>
	{:else if error}
		<p style="color: red;">❌ {error}</p>
	{:else if lessons.length === 0}
		<p>📝 Nothing to show</p>
	{:else}
		{#each lessons as lesson}
			<div class="lesson">
				<strong>{lesson.subject}</strong> by {lesson.teacher.firstName}
				{lesson.teacher.lastName} for {lesson.studentGroup.name}
			</div>
		{/each}
	{/if}
</main>
