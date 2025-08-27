<script lang="ts">
    import { SvelteDate } from 'svelte/reactivity';

    const date = new SvelteDate();
    const dateFormat: Intl.DateTimeFormatOptions = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    };

    const formatter = new Intl.DateTimeFormat("en-GB", dateFormat);

    $effect(() => {
        const interval = setInterval(() => {
            date.setTime(Date.now());
        }, 1000);

        return () => {
            clearInterval(interval);
        };
    });

    const dateToShow = formatter.format(date);
</script>

<h1>Welcome to EduPlanner! Today is {dateToShow}</h1>