<script>
    import {createEventDispatcher} from 'svelte';
    let dispatch = createEventDispatcher();

    import {onMount} from 'svelte'
    import Calendar from 'tui-calendar';
    import "tui-calendar/dist/tui-calendar.css";
    import Pop from "../../components/Pop.svelte";
    import {saveData} from "../../firebase";

    export let data = [];

    let calendar;
    let schedule = [];

    data.forEach(doc => {
        let valid = true;
        if (doc.type === 'project') valid = false;
        let tasks = data.filter(el => {return el.milestone === doc.id})
        if (doc.type === 'milestone' && ((!doc.starting && !doc.ending) || tasks.length<1) && tasks.filter(el => {return el.starting || el.ending}).length<1 ) valid = false;
        let milestone = data.find(el => el.id===doc.milestone)
        if (doc.type === 'task' && !doc.starting && !doc.ending && !milestone?.starting && !milestone?.ending) valid = false;
        if (valid) schedule.push({
                id: doc.id,
                title: doc.name + (doc.type === 'task' ? '' : ' - ' + data.find(el => el.id===doc.project)?.name),
                calendarId: doc.project,
                category: doc.type === 'task' ? 'time' : 'allday',
                start: doc.starting, // || new Date((doc.done || doc.ending)).setMinutes( new Date().getMinutes() - 1),
                end: doc.ending, // doc.done
                bgColor: doc.type === 'task' ? data.find(el => el.id===doc.milestone)?.color || '#00c97e' : doc.color,
                color: doc.type === 'task' ? doc.color : '',

            })
    })

    onMount(() => {
        calendar = new Calendar('#calendar', {
            usageStatistics: false,
            defaultView: 'day',
            taskView: false,
            scheduleView: true,
            week: {
                narrowWeekend: true
            },
            template: {

                alldayTitle: function() {
                    return '<span class="tui-full-calendar-left-content font-bold text-primary uppercase">Goals</span>';
                },
            }
        });
        calendar.createSchedules(schedule);
        calendar.on('beforeUpdateSchedule', function(event) {
            let schedule = event.schedule;
            let changes = event.changes;
            if (changes){
                let doc = data.find(el => el.id===schedule.id)
                if (changes.start) doc.starting = new Date(changes.start)
                if (changes.end) doc.ending = new Date(changes.end)
                calendar.updateSchedule(schedule.id, schedule.calendarId, changes);
                saveData(doc)
            }
        });
    })


</script>


<Pop on:close={()=>dispatch('close')}>
    <div class="full-overlay" id="calendar"></div>
    <div class="absolute bottom-0">
        <button on:click={()=>calendar.changeView('day', true)}>D</button>
        <button on:click={()=>calendar.changeView('week', true)}>W</button>
        <button on:click={()=>calendar.changeView('month', true)}>M</button>

        <button on:click={()=>calendar.prev()}>P</button>
        <button on:click={()=>calendar.next()}>N</button>
    </div>
</Pop>

<style>
    button {
        @apply font-bold text-white m-2 px-2 bg-primary rounded-full w-8 h-8 text-center;
    }
</style>