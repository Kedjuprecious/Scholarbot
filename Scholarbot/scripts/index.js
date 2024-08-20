document.getElementById('send-button').addEventListener('click', async () => {
    const userInput = document.getElementById('user-input').value;

    if (userInput.trim() === '') {
        alert('Please enter a message.');
        return;
    }

    // Append user's message to chat
    appendMessage('You', userInput);

    try {
        // Send user's message to the backend API
        const response = await fetch('http://localhost:3000/api/message', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message: userInput })
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        // Get the response from the API
        const data = await response.json();

        // Append bot's reply to chat
        appendMessage('ScholarBot', data.reply);
    } catch (error) {
        console.error('Error:', error);
        appendMessage('ScholarBot', 'Sorry, there was an error processing your request.');
    }

    // Clear input field
    document.getElementById('user-input').value = '';
});

function appendMessage(sender, text) {
    const chatBox = document.getElementById('chat-box');
    const message = document.createElement('div');
    message.innerHTML = `<strong>${sender}:</strong> ${text}`;
    chatBox.appendChild(message);
    chatBox.scrollTop = chatBox.scrollHeight;
}
