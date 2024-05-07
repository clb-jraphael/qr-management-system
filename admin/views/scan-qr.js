var scanner = new Instascan.Scanner({ video: document.getElementById('preview') });
Instascan.Camera.getCameras().then(function (cameras) {
    if (cameras.length > 0) {
        scanner.start(cameras[0]);
    } else {
        alert("No camera found.");
    }
}).catch(function (e) {
    console.error(e);
});

scanner.addListener('scan', function (scannedResult) {
    
    fetch('/scanQRCode', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        //post scanned result
        body: JSON.stringify({ scannedData: scannedResult }),
    })
        .then(async (response) => {
            if (!response.ok) {
                if (response.status === 400) {
                    clearErrorMsg();
                    const errorMsg = await response.text();
                    createResponse(errorMsg, 'error-msg');
                } else {
                    throw new Error('Failed to scan QR code');
                }
            } else {
                clearErrorMsg();
                const successMsg = await response.text();
                createResponse(successMsg, 'success-msg');
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
        
});

function createResponse(msg, classAttr) {
    const responseContainer = document.getElementById('response-container');
    const pElement = document.createElement('p');
    pElement.setAttribute('class', classAttr);
    pElement.innerText = msg;
    responseContainer.appendChild(pElement);
}

function clearErrorMsg() {
    document.getElementById('response-container').innerHTML = '';
}



const inputContainer = document.getElementById('input-container');
const vidContainer = document.getElementById('preview');
const inputKeyBtn = document.getElementById('show-input');
const scanInsteadBtn = document.getElementById('scan-instead');

inputKeyBtn.addEventListener('click', function () {
    inputKeyBtn.style.display = 'none';
    scanInsteadBtn.style.display = 'flex';
    inputContainer.style.display = 'block';
    vidContainer.style.display = 'none';
    
    scanner.stop();
    
});

scanInsteadBtn.addEventListener('click', function () {
    vidContainer.style.display = 'block';
    inputKeyBtn.style.display = 'block';
    scanInsteadBtn.style.display = 'none';
    inputContainer.style.display = 'none';

    scanner.start();
    
});

const popupValidate = document.getElementById('popup');
const qrContent = document.getElementById('qr-content');
const inputField = document.getElementById('input-field');
const submitBtn = document.getElementById('submit-key');
const grantBtn = document.getElementById('grantBtn');
const declineBtn = document.getElementById('decBtn');
    
function validateParticipant() {
    const regId = inputField.value.trim();

    if (!regId) {
        console.error('Error: Registration ID is empty.');
        return;
    }

    fetch('/checkRegistrationId', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ registrationId: regId }),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Server returned ${response.status} ${response.statusText}`);
        }
        return response.json();
    })
    .then(data => {
        const message = data.message;
        qrContent.innerText = message;
    })
    .catch(error => {
        console.error('Error validating participant:', error);
    });
}

function grantParticipant(regId) {
    fetch('/granting', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ participantData: regId }),
    })
    .then(async (response) => {
        if (!response.ok) {
            if (response.status === 400) {
                clearErrorMsg();
                const errorMsg = await response.text();
                createResponse(errorMsg, 'error-msg');
            } else {
                throw new Error('Failed to scan QR code');
            }
        } else {
            clearErrorMsg();
            const successMsg = await response.text();
            createResponse(successMsg, 'success-msg');
        }
    })
    .catch(error => {
        console.error('Error granting participant:', error);
    });

    popupValidate.style.display = 'none';
}

function declineParticipant() {
    popupValidate.style.display = 'none';
}

submitBtn.addEventListener('click', validateParticipant);
grantBtn.addEventListener('click', () => grantParticipant(inputField.value.trim()));
declineBtn.addEventListener('click', declineParticipant);
