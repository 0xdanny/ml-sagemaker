document.getElementById("fetchButton").addEventListener("click", async () => {
    try {
        // Show loading indicator
        document.getElementById("loadingIndicator").style.display = "block";
        // Hide response container
        document.getElementById("responseContainer").innerHTML = "";

        const response = await fetch("/fetchGoldPrices");
        const data = await response.json();

        // Display response
        const responseContainer = document.getElementById("responseContainer");
        responseContainer.innerHTML = `<pre>${JSON.stringify(data, null, 2)}</pre>`;
        // Hide loading indicator
        document.getElementById("loadingIndicator").style.display = "none";
    } catch (error) {
        console.error("Error fetching gold prices:", error);
        alert("Error fetching gold prices. Please check console for details.");
        // Hide loading indicator in case of error
        document.getElementById("loadingIndicator").style.display = "none";
    }
});
