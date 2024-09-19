const synth = window.speechSynthesis;

const inputForm = document.querySelector("form");
const inputTxt = document.querySelector(".txt");
const voiceSelect = document.querySelector("select");

const pitch = document.querySelector("#pitch");
const pitchValue = document.querySelector(".pitch-value");
const rate = document.querySelector("#rate");
const rateValue = document.querySelector(".rate-value");

let voices = [];
let audioChunks = []; // to store chunks audio

// Inisialisation AudioContext & MediaStreamDestination to record
const audioContext = new AudioContext();
const destination = audioContext.createMediaStreamDestination();
const mediaRecorder = new MediaRecorder(destination.stream);

// Populate list voices
function populateVoiceList() {
  voices = synth.getVoices().sort(function (a, b) {
    const aname = a.name.toUpperCase();
    const bname = b.name.toUpperCase();

    if (aname < bname) {
      return -1;
    } else if (aname === bname) {
      return 0;
    } else {
      return +1;
    }
  });
  const selectedIndex =
    voiceSelect.selectedIndex < 0 ? 0 : voiceSelect.selectedIndex;
  voiceSelect.innerHTML = "";

  for (let i = 0; i < voices.length; i++) {
    const option = document.createElement("option");
    option.textContent = `${voices[i].name} (${voices[i].lang})`;

    if (voices[i].default) {
      option.textContent += " -- DEFAULT";
    }

    option.setAttribute("data-lang", voices[i].lang);
    option.setAttribute("data-name", voices[i].name);
    voiceSelect.appendChild(option);
  }
  voiceSelect.selectedIndex = selectedIndex;
}

populateVoiceList();

if (speechSynthesis.onvoiceschanged !== undefined) {
  speechSynthesis.onvoiceschanged = populateVoiceList;
}

function speak() {
  if (synth.speaking) {
    console.error("speechSynthesis.speaking");
    return;
  }

  if (inputTxt.value !== "") {
    const utterThis = new SpeechSynthesisUtterance(inputTxt.value);

    utterThis.onend = function (event) {
      console.log("SpeechSynthesisUtterance.onend");
      mediaRecorder.stop(); // Stop record while don't speak
    };

    utterThis.onerror = function (event) {
      console.error("SpeechSynthesisUtterance.onerror");
    };

    const selectedOption =
      voiceSelect.selectedOptions[0].getAttribute("data-name");

    for (let i = 0; i < voices.length; i++) {
      if (voices[i].name === selectedOption) {
        utterThis.voice = voices[i];
        break;
      }
    }

    utterThis.pitch = pitch.value;
    utterThis.rate = rate.value;

    // connect audio from SpeechSynthesis to AudioContext
    const audioElement = new Audio();
    audioElement.srcObject = destination.stream;
    const source = audioContext.createMediaElementSource(audioElement);
    source.connect(destination);
    source.connect(audioContext.destination);

    // Start recording while speak
    mediaRecorder.start();

    // starting speak
    synth.speak(utterThis);
  }
}

// Event handler recording
mediaRecorder.ondataavailable = function (event) {
  audioChunks.push(event.data);
};

mediaRecorder.onstop = function () {
  const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
  const audioURL = URL.createObjectURL(audioBlob);

  // display audi recording
  const audio = new Audio(audioURL);
  audio.play();

  // Close button
const closeButton = document.createElement('button');
closeButton.textContent = 'X'; // Teks tombol tutup
closeButton.classList.add('close-button');

// add eventListener to close button
closeButton.addEventListener('click', (event) => {
  event.stopPropagation(); // preven close button click
  event.preventDefault(); // preven default action button if there.
  if (downloadLinkContainer.parentElement) {
    downloadLinkContainer.remove(); // remove all the container
  }
});

// create element <a>
const downloadLink = document.createElement('a');
downloadLink.href = audioURL;
downloadLink.download = 'speech_recording.wav';
downloadLink.classList.add('download-link');
downloadLink.textContent = 'Download Recording';

// wrap link download & close button with container
const downloadLinkContainer = document.createElement('div');
downloadLinkContainer.classList.add('download-link-container');
downloadLinkContainer.appendChild(downloadLink); // add link download to container
downloadLinkContainer.appendChild(closeButton); // add close button to container

// find container with controls class
const controlsContainer = document.querySelector('.controls');

// add container
if (controlsContainer) {
  controlsContainer.appendChild(downloadLinkContainer);
}


};

inputForm.onsubmit = function (event) {
  event.preventDefault();
  audioChunks = []; // Reset array audioChunks
  speak();
  inputTxt.blur();
};

pitch.onchange = function () {
  pitchValue.textContent = pitch.value;
};

rate.onchange = function () {
  rateValue.textContent = rate.value;
};

voiceSelect.onchange = function () {
  speak();
};
