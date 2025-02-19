const firebaseConfig = {
    apiKey: "AIzaSyAzPtDovm1jXS49H416fWlMeCQT1D1LUjw",
    authDomain: "pawsitiveminders-88e5c.firebaseapp.com",
    databaseURL: "https://pawsitiveminders-88e5c-default-rtdb.firebaseio.com",
    projectId: "pawsitiveminders-88e5c",
    storageBucket: "pawsitiveminders-88e5c.appspot.com",
    messagingSenderId: "354472674033",
    appId: "1:354472674033:web:51447e86196cd5694c1f50",
};

firebase.initializeApp(firebaseConfig);


const loginForm = document.getElementById("login-form");
const emailField = document.getElementById("email");
const passwordField = document.getElementById("password");
const errorMessage = document.getElementById("error-message");


loginForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const email = emailField.value;
    const password = passwordField.value;

    firebase.auth().signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            const user = userCredential.user;

            const userRef = firebase.firestore().collection("users").doc(user.uid);
            userRef.get()
                .then((doc) => {
                    if (doc.exists) {
                        const userData = doc.data();
                        if (userData.role === 'admin') {
                            window.location.href = "index.html";
                        } else {
                            errorMessage.textContent = "Error: You are not authorized to access this page.";
                        }
                    } else {
                        errorMessage.textContent = "Error: User data not found.";
                    }
                })
                .catch((error) => {
                    errorMessage.textContent = `Error: ${error.message}`;
                });
        })
        .catch((error) => {
            const errorMessageText = error.message;
            errorMessage.textContent = `Error: ${errorMessageText}`;
        });
});
