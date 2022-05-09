<script>
    const tips = [
        {
            name: 'Add custom tags by typing :tag#color',
            tags: ['tip#brown']
        }
    ]
</script>

<div class="m-4">
    <div class="card mt-4 mb-2 pb-1">
        <div class="m-2">
            <h2 class="text-lg font-bold flex items-center">
                Tips & Tricks
            </h2>
            <div class="card mt-1 p-1 md:p-2">
                {#each tips as tip}
                    <div class="flex justify-between items-center hover:bg-back rounded group">
                        <div class="flex items-center group relative flex-1">
                            <div class="py-1">
                                <p style="color: {tip.color}">
                                    {tip.name}
                                    {#each tip.tags as tag}
                                        <span class="tag uppercase font-bold bg-primary" style="background-color: {tag.split('#')[1]}">{tag.split('#')[0]}</span>
                                    {/each}
                                </p>
                            </div>
                        </div>
                    </div>
                {/each}
            </div>
        </div>
    </div>
</div>