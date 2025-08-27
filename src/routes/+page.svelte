<script>
    import Header from "./Header.svelte";
    import Timetable from "./Timetable.svelte";
    import StudentGroups from "./StudentGroups.svelte";
    import Teachers from "./Teachers.svelte";
    import Timeslots from "./Timeslots.svelte";
    import Rooms from "./Rooms.svelte";

    export let menu = 1;
</script>

<Header />



<style>
    ul#menu li{
        display : inline;
    }
</style>

<ul id="menu">
    <li><a href="/" on:click|preventDefault={() => (menu = 1)}>Timetable</a></li> |
    <li><a href="/" on:click|preventDefault={() => (menu = 2)}>Timeslots</a></li> |
    <li><a href="/" on:click|preventDefault={() => (menu = 3)}>Rooms</a></li> |
    <li><a href="/" on:click|preventDefault={() => (menu = 4)}>Student Groups</a></li> |
    <li><a href="/" on:click|preventDefault={() => (menu = 5)}>Teachers</a></li>
</ul>



{#if menu === 1}
    <Timetable />
{:else if menu === 2}
    <Timeslots />
{:else if menu === 3}
    <Rooms />
{:else if menu === 4}
    <StudentGroups />
{:else if menu === 5}
    <Teachers />
{:else}
    <h1>
        Page Not Found
    </h1>
{/if}