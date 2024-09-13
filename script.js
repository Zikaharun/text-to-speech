const synth = window.speechSynthesis;

const inputForm = document.querySelector("form");
const inputTxt = document.querySelector(".txt");
const voiceSelect = document.querySelector("select");

const pitch = document.querySelector("#pitch");
const pitchValue = document.querySelector(".pitch-value");
const rate = document.querySelector("#rate");
const rateValue = document.querySelector(".rate-value");

let voices = [];
let audioChunks = []; // Untuk menyimpan potongan audio

// Inisialisasi AudioContext dan MediaStreamDestination untuk merekam
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
      mediaRecorder.stop(); // Berhenti merekam saat selesai bicara
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

    // Hubungkan audio dari SpeechSynthesis ke AudioContext
    const audioElement = new Audio();
    audioElement.srcObject = destination.stream;
    const source = audioContext.createMediaElementSource(audioElement);
    source.connect(destination);
    source.connect(audioContext.destination);

    // Mulai merekam saat mulai bicara
    mediaRecorder.start();

    // Mulai bicara
    synth.speak(utterThis);
  }
}

// Event handler saat merekam
mediaRecorder.ondataavailable = function (event) {
  audioChunks.push(event.data);
};

mediaRecorder.onstop = function () {
  const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
  const audioURL = URL.createObjectURL(audioBlob);

  // Menampilkan audio hasil rekaman
  const audio = new Audio(audioURL);
  audio.play();

  // Membuat tombol tutup
const closeButton = document.createElement('button');
closeButton.textContent = 'X'; // Teks tombol tutup
closeButton.classList.add('close-button');

// Menambahkan event listener ke tombol tutup
closeButton.addEventListener('click', (event) => {
  event.stopPropagation(); // Mencegah klik tombol tutup memicu klik pada link
  event.preventDefault(); // Mencegah aksi default tombol jika ada
  if (downloadLinkContainer.parentElement) {
    downloadLinkContainer.remove(); // Menghapus seluruh kontainer
  }
});

// Membuat elemen <a>
const downloadLink = document.createElement('a');
downloadLink.href = audioURL;
downloadLink.download = 'speech_recording.wav';
downloadLink.classList.add('download-link');
downloadLink.textContent = 'Download Recording';

// Membungkus link download dan tombol tutup dengan kontainer
const downloadLinkContainer = document.createElement('div');
downloadLinkContainer.classList.add('download-link-container');
downloadLinkContainer.appendChild(downloadLink); // Menambahkan link download ke kontainer
downloadLinkContainer.appendChild(closeButton); // Menambahkan tombol tutup ke kontainer

// Temukan kontainer dengan kelas 'controls'
const controlsContainer = document.querySelector('.controls');

// Tambahkan kontainer yang berisi link download dan tombol tutup ke dalam kontainer 'controls'
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
