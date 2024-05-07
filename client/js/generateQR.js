// Call the function once the DOM is fully loaded
document.addEventListener('DOMContentLoaded', generateQRCode);

function generateQRCode() {
    document.querySelectorAll('.register-qr').forEach(function(button) {
        button.addEventListener('click', function () {

            var row = this.closest('tr');
            var title = row.querySelector('#event-name').innerText;
            
            //data to be encoded to QRcode
            const data = {
                email: userEmail,
                eventTitle: title,
            };
            
            // Make a request to node server for QR code generation
            fetch(targetServer + '/generateQRCode', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            })
            .then(async (response) => {
                resetElement('error-container');
                resetElement('qr-container');
                if (!response.ok) {
                    if (response.status === 400) {
                        const errorMsg = await response.text();
                        showDuplicateEntryError(errorMsg);
                    } else {
                        throw new Error('Failed to generate QR code');
                    }
                }
                return response.json();
            })
            .then(result => {
                resetElement('error-container');
                resetElement('qr-container');
                //Show a floating window that contains QR Code
                showGeneratedQRCode(title, userEmail, result.qrCode);

                const dataToSend = {
                    qrCode: result.qrCode,
                    data: data,
                };

                //send back to server.js to store qr code to db
                fetch(targetServer + '/storeQRCode', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(dataToSend),
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Failed to store QR code on the server');
                    }
                    return response.json();
                })
            })
            .catch(error => {
                console.error('Error:', error.message);
            });
        });
    });
}

function showDuplicateEntryError(errorMessage) {
    //create element using DOM to contain duplicate entry error
    const errorDiv = document.createElement('div');
    errorDiv.setAttribute('id','error-container');
    const pElement = document.createElement('p');
    pElement.setAttribute('id', 'error-msg');
    pElement.textContent = errorMessage;
    errorDiv.append(pElement);
    
    const closeButton = document.createElement('button');
    closeButton.textContent = 'Close';
    closeButton.addEventListener('click', () => {
        errorDiv.remove();
    });
    errorDiv.appendChild(closeButton);
    document.body.appendChild(errorDiv);
}

function showGeneratedQRCode(eventTitle, email, qrcodeImg) {
    //create element using DOM to contain duplicate entry error
    const QrDivContainer = document.createElement('div');
    QrDivContainer.setAttribute('id','qr-container');

    //Title of the event
    const eventTitleElement = document.createElement('h5');
    eventTitleElement.setAttribute('id', 'event-title');
    eventTitleElement.textContent = `Successfully registered to event: ${eventTitle}`;

    //Instruction
    const instructionElement = document.createElement('p');
    instructionElement.setAttribute('id', 'instruction');
    instructionElement.textContent = 'Scan this QR at the event venue for your attendance.';

    //QR code image
    const imgElement = document.createElement('img');
    imgElement.setAttribute('id', 'qr-img');
    imgElement.src = qrcodeImg;
    imgElement.alt = 'QRCode';
    
    const textElement = document.createElement('p');
    textElement.textContent = 'View your QR codes ';

    //Link to QR code page
    const linkElement = document.createElement('a');
    linkElement.setAttribute('id', 'view-qr-link');
    linkElement.href = '../php/view-qrcodes.php';
    linkElement.textContent = 'here.';
    
    textElement.append(linkElement);

    const downloadElement = document.createElement('a');
    downloadElement.setAttribute('id', 'download-btn');
    downloadElement.href = qrcodeImg;
    downloadElement.setAttribute('download', 'QRCode_' + eventTitle + '_' + email + '.png');
    downloadElement.innerHTML = 'Download';
    
    //Confirm button
    const closeButton = document.createElement('button');
    closeButton.setAttribute('id', 'confirm-btn');
    closeButton.textContent = 'Confirm';
    closeButton.addEventListener('click', () => {
        QrDivContainer.remove();
    });

    //Append all created elements
    QrDivContainer.append(eventTitleElement);
    QrDivContainer.append(instructionElement);
    QrDivContainer.append(imgElement);
    QrDivContainer.append(textElement);
    QrDivContainer.append(downloadElement);
    QrDivContainer.append(closeButton);
    document.body.appendChild(QrDivContainer);
}

function resetElement(elementAttribute) {
    if (document.getElementById(elementAttribute)) {
        document.getElementById(elementAttribute).remove();
    }
}