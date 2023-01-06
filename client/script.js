//Import images
import bot from './assets/bot.svg';
import user from './assets/user.svg';

//Get elements
const form = document.querySelector('form');
const chatContainer = document.querySelector('#chat_container');

let loadInterval;

//Laoder function
function loader(element) {
    element.textContent = '';

    loadInterval = setInterval(() => {
        element.textContent += '.';

        if (element.textContent === '....') {
            element.textContent = '';
        }
    }, 300);
}

function typetext(element, text) {
    let index = 0;

    let interval = setInterval(() => {
        if (index < text.length) {
            element.innerHTML += text.charAt(index);
            index++;
        } else {
            clearInterval(interval);
        }
    }, 20);
}

function generateUniqueId() {
    const timestamp = Date.now();
    const randomNumber = Math.random();
    const hexadecimalString = randomNumber.toString(16);

    return `id-${timestamp}-${hexadecimalString}`;
}

function chatStripe(isAi, value, uniqueId) {
    return `
      <div class="wrapper ${isAi && 'ai'}">
        <div class="chat">
          <div class = "profile">
            <img 
              src="${isAi ? bot : user}"
              alt="${isAi ? 'bot' : 'user'}"
            />
          </div>
          <div class="message" id=${uniqueId}>${value}</div>
        </div>
      </div>
    `;
}

const handleSubmit = async(e) => {
    const data = new FormData(form);

    //User's chat stripe
    chatContainer.insertAdjacentHTML(
        'beforeend',
        chatStripe(false, data.get('prompt'))
    );

    //Clear form inputs
    form.reset();

    //Bot's chat stripe
    const uniqueId = generateUniqueId();
    chatContainer.insertAdjacentHTML('beforeend', chatStripe(true, '', uniqueId));

    chatContainer.scrollTop = chatContainer.scrollHeight;

    const messageDiv = document.getElementById(uniqueId);

    loader(messageDiv);

    //fetch data from the server -> bot's response
    const response = await fetch('http://localhost:5000', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            prompt: data.get('prompt'),
        }),
    });

    clearInterval(loadInterval);
    messageDiv.innerHTML = '';

    if (response.ok) {
        const data = await response.json();
        const parsedData = data.bot.trim();

        console.log(parsedData);

        typetext(messageDiv, parsedData);
    } else {
        const err = await response.text();

        messageDiv.innerHTML = 'Something went wrong';

        alert(err);
    }

    e.preventDefault();
};

form.addEventListener('submit', handleSubmit);
form.addEventListener('keyup', (e) => {
    if (e.keyCode === 13) handleSubmit(e);
});