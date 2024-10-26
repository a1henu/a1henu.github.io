document.addEventListener("DOMContentLoaded", function() {
    const repoOwner = "a1henu"; 
    const repoName = "a1henu.github.io"; 

    fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/commits`)
        .then(response => response.json())
        .then(data => {
            const lastCommitDate = new Date(data[0].commit.author.date);
            const formattedDate = lastCommitDate.toLocaleDateString('en-GB', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            document.getElementById("last-update").textContent = `Last Updated on ${formattedDate}`;
        })
        .catch(error => console.error('Error fetching GitHub data:', error));
});