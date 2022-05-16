<script>
    import {createEventDispatcher} from 'svelte';
    let dispatch = createEventDispatcher();

    import {onMount} from 'svelte'
    import Calendar from 'tui-calendar';
    import "tui-calendar/dist/tui-calendar.css";
    import Pop from "../../components/Pop.svelte";
    import {deleteData, saveData} from "../../firebase";

    export let data = [];

    let calendar;
    let schedule = [];

    $: {
        schedule = [];
        data.forEach(doc => {

            let starting = doc.starting;
            let ending = doc.ending;

            let valid = !['project', 'user'].includes(doc.type);

            let tasks = data.filter(el => {return el.milestone === doc.id})
            if (doc.type === 'milestone') {
                valid = !(((!doc.starting && !doc.ending) || tasks.length<1) && tasks.filter(el => {return el.starting || el.ending}).length<1 )
                if (valid) {
                    let starters = tasks.filter(el => {return el.starting}).sort((a, b) => {return a.starting - b.starting})
                    let endings = tasks.filter(el => {return el.ending}).sort((a, b) => {return a.ending - b.ending})
                    if (!starting) {
                        starting = starters[0].starting
                        let ender = endings[0].ending
                        if (!starting || starting>ender) starting = ender
                        if (!starting) starting = new Date();
                    }
                    if (!ending || ending < new Date()) {
                        ending = endings[endings.length-1]?.ending
                        let starter = starters[starters.length-1].starting
                        if (!ending || ending<starter) ending = starter;
                        if (!ending || ending<new Date()) ending = new Date();
                    }
                }

            }

            let milestone = data.find(el => el.id===doc.milestone)
            if (doc.type === 'task') {
                valid = !(!doc.starting && !doc.ending && !milestone?.starting && !milestone?.ending)
                if (valid && doc.repeat){
                    let current = new Date().getDate();
                    doc.starting.setDate(current)
                    doc.ending.setDate(current)
                    if (doc.ending < new Date()) {
                        doc.starting.setDate(current+1)
                        doc.ending.setDate(current+1)
                    }
                }
            }


            let project = data.find(el => el.id===doc.project)
            if (valid) schedule.push({ // check attendees, recurrence rule
                id: doc.id,
                title: doc.name + (doc.type === 'task' ? '' : ' - ' + project?.name || ''),
                calendarId: doc.project,
                category: doc.type === 'task' ? 'time' : 'allday',
                isPending: ending && new Date()>ending,
                body: project?.name || '' + '<br>' + doc.description || '',
                start: starting,
                end: ending,
                bgColor: doc.type === 'task' ? data.find(el => el.id===doc.milestone)?.color || (doc.repeat ? '#00c97e' : '#f8f8f8') : doc.color,
                color: doc.type === 'task' ? doc.color : '#10162A',
                dragBgColor: "#FF5964",
                borderColor: doc.repeat ? '#FF5964' : doc.color
            })

        })
        if (calendar) {
            calendar.clear();
            calendar.createSchedules(schedule)
        }
    }

    onMount(() => {
        calendar = new Calendar('#calendar', {
            usageStatistics: false,
            defaultView: 'day',
            taskView: false,
            scheduleView: true,
            useDetailPopup: true,
            useCreationPopup: false,
            disableClick: true,
            week: {
                narrowWeekend: true,
                hourStart: 0,
                hourEnd: 24,
            },
            month: {
                visibleWeeksCount: 4,
            },
            template: {

                alldayTitle: function() {
                    return '<span class="tui-full-calendar-left-content font-bold text-primary uppercase">Goals</span>';
                },
            }
        });
        calendar.createSchedules(schedule);
        calendar.on({
            'beforeUpdateSchedule': function(event) {
                let schedule = event.schedule;
                let changes = event.changes;
                let doc = data.find(el => el.id === schedule.id)
                if (changes) {
                    if (changes.start) doc.starting = new Date(changes.start)
                    if (changes.end) doc.ending = new Date(changes.end)
                    calendar.updateSchedule(schedule.id, schedule.calendarId, changes);
                    saveData(doc)
                }else dispatch('data', doc)
            },
            'beforeCreateSchedule': function(event) {
                if (!event.isAllDay)
                    dispatch('data', {type: 'task', starting: new Date(event.start), ending: new Date(event.end), repeat: true})
            },
            'beforeDeleteSchedule': function(event) {
                let schedule = event.schedule;
                let doc = data.find(el => el.id === schedule.id)
                calendar.deleteSchedule(schedule.id, schedule.calendarId);
                deleteData(doc)
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