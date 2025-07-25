const input = document.getElementById('searchInput');
const suggestions = document.getElementById('searchSuggestions');

if (input && suggestions) {
    input.addEventListener('input', async () => {
        const query = input.value.trim();
        if (!query) {
            suggestions.innerHTML = '';
            return;
        }
        try {
            const res = await fetch(`/listings/search?q=${encodeURIComponent(query)}`);
            if (!res.ok) return;
            const data = await res.json();
            suggestions.innerHTML = '';
            data.forEach(listing => {
                const a = document.createElement('a');
                a.href = `/listings/${listing._id}`;
                a.className = 'list-group-item list-group-item-action';
                a.textContent = `${listing.title} - ${listing.location}`;
                suggestions.appendChild(a);
            });
        } catch (e) {
            console.error(e);
        }
    });

    document.addEventListener('click', (e) => {
        if (!suggestions.contains(e.target) && e.target !== input) {
            suggestions.innerHTML = '';
        }
    });
}

