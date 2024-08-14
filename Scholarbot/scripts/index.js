document.getElementById('send-button').addEventListener('click', async () => {
    const userInput = document.getElementById('user-input').value;
    const userName = document.getElementById('user-name').value;
    const userEmail = document.getElementById('user-email').value;

    if (userInput.trim() === '' || userName.trim() === '' || userEmail.trim() === '') {
        alert('Please fill out all fields.');
        return;
    }

    // Append user's message to chat
    appendMessage('You', userInput);

    // Send user's message to the backend API
    const response = await fetch('/api/message', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name: userName,
            email: userEmail,
            message: userInput
        })
    });

    // Get the response from the API
    const data = await response.json();

    // Append bot's reply to chat
    appendMessage('ScholarBot', data.reply);

    // Clear input fields
    document.getElementById('user-input').value = '';
});

function appendMessage(sender, text) {
    const chatBox = document.getElementById('chat-box');
    const message = document.createElement('div');
    message.classList.add('mb-2');
    message.innerHTML = `<strong>${sender}:</strong> ${text}`;
    chatBox.appendChild(message);
    chatBox.scrollTop = chatBox.scrollHeight;
}
