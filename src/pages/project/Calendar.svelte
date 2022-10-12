<script>
    import {createEventDispatcher} from 'svelte';
    let dispatch = createEventDispatcher();

    import {onMount} from 'svelte'
    import Calendar from 'tui-calendar';
    import "tui-calendar/dist/tui-calendar.css";
    import Pop from "../../components/Pop.svelte";
    import {deleteData, saveData} from "../../firebase";

    import { RRule, RRuleSet, rrulestr } from 'rrule'

    export let data = [];
    export let users;
    export let user;
    export let filter;

    let calendar;
    let schedule = [];

    $: {
        schedule = [];
        data.forEach(doc => {

            let starting = doc.starting;
            let ending = doc.ending;

            let valid = !['project', 'user'].includes(doc.type) && (filter==='all' || !filter || [doc.id, doc.project, doc.milestone].includes(filter));

            if (valid){

                let tasks = data.filter(el => {return el.milestone === (doc.type==='task'? doc.milestone: doc.id) && el.type === 'task' && !el.repeat})
                if (doc.type === 'milestone') {
                    valid = !(((!starting && !ending) || tasks.length<1) && tasks.filter(el => {return el.starting || el.ending}).length<1 )
                    if (valid) {
                        let starters = tasks.filter(el => {return el.starting}).sort((a, b) => {return a.starting - b.starting})
                        let endings = tasks.filter(el => {return el.ending}).sort((a, b) => {return a.ending - b.ending})
                        if (!starting || (starters[0]?.starting && starting>starters[0].starting) ) {
                            starting = starters[0]?.starting
                            let ender = endings[0]?.ending
                            if (!starting || starting>ender) starting = ender
                            if (!starting) starting = new Date();
                        }
                        if (!ending || ending < new Date()) {
                            ending = endings[endings.length-1]?.ending
                            let starter = starters[starters.length-1]?.starting
                            if (!ending || ending<starter) ending = starter;
                            if (!ending || ending<new Date()) ending = new Date();
                        }
                    }

                }

                let milestone = data.find(el => el.id===doc.milestone)
                if (doc.type === 'task') {

                    valid = !(!starting && !ending && !milestone?.starting && !milestone?.ending)
                    if (doc.repeat){

                        let days = [];
                        if (typeof doc.repeat === 'boolean' || doc.repeat.includes('0')) days.push(RRule.SU)
                        if (typeof doc.repeat === 'boolean' || doc.repeat.includes('1')) days.push(RRule.MO)
                        if (typeof doc.repeat === 'boolean' || doc.repeat.includes('2')) days.push(RRule.TU)
                        if (typeof doc.repeat === 'boolean' || doc.repeat.includes('3')) days.push(RRule.WE)
                        if (typeof doc.repeat === 'boolean' || doc.repeat.includes('4')) days.push(RRule.TH)
                        if (typeof doc.repeat === 'boolean' || doc.repeat.includes('5')) days.push(RRule.FR)
                        if (typeof doc.repeat === 'boolean' || doc.repeat.includes('6')) days.push(RRule.SA)

                        let duration = ending - starting;
                        const rule1 = new RRule({
                            freq: RRule.DAILY,
                            byweekday: days,
                            dtstart: ending
                        })
                        ending = new Date(rule1.between(new Date(), new Date(new Date().setMonth(new Date().getMonth() + 1)))[0])
                        starting = ending - duration;

                    }

                    const setTime = (input, offset) => {
                        let date = new Date(input)
                        date.setHours(date.getHours()+offset)
                        return date;
                    }

                    if (valid && !starting && !ending){
                        let index = tasks.indexOf(doc)
                        if (milestone?.ending) {
                            ending = setTime(milestone.starting, index+1)
                            if (!milestone.starting) starting = setTime(ending, -1)
                            if (ending > milestone.ending) ending = setTime(milestone.ending, 0)
                        }
                        if (milestone?.starting) {
                            starting = setTime(milestone.starting, index)
                            if (!milestone.ending) ending = setTime(starting, 1)
                            if (starting >= ending) starting = setTime(ending, -1)
                        }
                    }

                    if (valid && !starting)
                        starting = setTime(ending, -1)
                    if (valid && !ending)
                        ending = setTime(starting, 1)

                }

                let project = data.find(el => el.id===doc.project)

                let tags = '';
                doc.tags.forEach(tag => tags += '<span class="tag uppercase font-bold bg-primary" style="background-color: '+ tag.substring(tag.indexOf('#')+1) +'">' + tag.split('#')[0] + '</span>')
                if (ending<new Date()) tags += '<span class="tag uppercase font-bold bg-secondary">late</span>'

                let shared = [];
                Object.keys(doc.users).forEach(u => {if (u !== user.uid) shared.push(users.find(el => el.user === u)?.name)} )



                if (valid) schedule.push({ // check attendees, recurrence rule
                    id: doc.id,
                    title: doc.name + (doc.type === 'task' && (!doc.project || doc.milestone) ? '' : ' - ' + project?.name || ''),
                    calendarId: doc.project,
                    category: doc.type === 'task' ? 'time' : 'allday',
                    isPending: ending && new Date()>ending,
                    body: (tags? tags + '<br>' : '') + '<span class="text-primary">' + (project?.name || '') + '</span>' + (milestone?.name ? ' - '+milestone.name: '') + (doc?.description? '<br>' + doc.description: ''),
                    start: starting,
                    end: ending,
                    bgColor: doc.type === 'task' ? milestone?.color || project?.color || (doc.repeat ? '#00c97e' : '#f8f8f8') : doc.color,
                    color: doc.type === 'task' ? doc.color : '#10162A',
                    dragBgColor: "#FF5964",
                    borderColor: doc.repeat ? '#FF5964' : doc.color,
                    attendees: shared
                })

            }

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
                    dispatch('data', {type: 'task', starting: new Date(event.start), project: filter!=='all'? filter: null})
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