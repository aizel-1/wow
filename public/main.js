// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAzPtDovm1jXS49H416fWlMeCQT1D1LUjw",
  authDomain: "pawsitiveminders-88e5c.firebaseapp.com",
  databaseURL: "https://pawsitiveminders-88e5c-default-rtdb.firebaseio.com",
  projectId: "pawsitiveminders-88e5c",
  storageBucket: "pawsitiveminders-88e5c.appspot.com",
  messagingSenderId: "354472674033",
  appId: "1:354472674033:web:51447e86196cd5694c1f50",
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Make sure firebase.auth() and firebase.firestore() are available
const auth = firebase.auth();
const db = firebase.firestore();

// Fetch veterinarians
function fetchVets() {
  const nonVerifiedVets = document.getElementById("non-verified-vets");
  const verifiedVets = document.getElementById("verified-vets");
  const vetStatus = document.getElementById("vet-status");

  nonVerifiedVets.innerHTML = "<p>Loading...</p>";
  verifiedVets.innerHTML = "<p>Loading...</p>";

  // Get the current filter status (Verified, Non-Verified, or All)
  let filterStatus = vetStatus.value;

  // Initialize counters
  let verifiedCount = 0;
  let nonVerifiedCount = 0;

  // Check if the user is logged in
  auth.onAuthStateChanged(user => {
    if (user) {
      // Fetch the user data from Firestore
      const userRef = db.collection("users").doc(user.uid);
      userRef.get()
        .then((doc) => {
          if (doc.exists) {
            const userData = doc.data();

            // Check if the user is verified
            if (userData.isVerified) {
              // Proceed to fetch veterinarians if the user is verified
              db.collection("users")
                .where("role", "==", "Veterinarian")
                .get()
                .then((querySnapshot) => {
                  nonVerifiedVets.innerHTML = "";
                  verifiedVets.innerHTML = "";

                  if (querySnapshot.empty) {
                    nonVerifiedVets.innerHTML = "<p>No veterinarians to verify.</p>";
                    verifiedVets.innerHTML = "<p>No verified veterinarians.</p>";
                    return;
                  }

                  querySnapshot.forEach((doc) => {
                    const vet = doc.data();
                    const vetCard = document.createElement("tr"); // Changed div to tr for table row

                    // Create vet card content with table-like structure
                    vetCard.innerHTML = `
                      <td>${vet.firstName} ${vet.lastName}</td>
                      <td>${vet.email}</td>
                      <td>${vet.licenseNumber || "N/A"}</td>
                      <td>${vet.specialty || "N/A"}</td>
                      <td class="table-action-btn">
                        ${!vet.isVerified ? 
                        `<button class="verify" onclick="verifyVet('${doc.id}')">Verify</button>
                          <button class="reject" onclick="rejectVet('${doc.id}')">Reject</button>`
                        : ''}
                      </td>
                    `;

                    // Add the vet card to the appropriate section based on verification status
                    if (vet.isVerified && (filterStatus === "verified" || filterStatus === "all")) {
                      verifiedVets.appendChild(vetCard);
                      verifiedCount++;
                    } else if (!vet.isVerified && (filterStatus === "nonVerified" || filterStatus === "all")) {
                      nonVerifiedVets.appendChild(vetCard);
                      nonVerifiedCount++;
                    }
                  });

                  // Update the total count
                  // document.getElementById("total-verified-vets").textContent = `Total Verified: ${verifiedCount}`;
                  // document.getElementById("total-non-verified-vets").textContent = `Total Non-Verified: ${nonVerifiedCount}`;

                })
                .catch((error) => {
                  console.error("Error fetching veterinarians:", error);
                });
            } else {
              // Show an error message if the user is not verified
              alert("You are not authorized to view this page.");
              window.location.href = "login.html";  // Redirect to login page
            }
          } else {
            alert("Error: User data not found.");
          }
        })
        .catch((error) => {
          console.error("Error fetching user data:", error);
        });
    } else {
      // Redirect to login page if no user is authenticated
      window.location.href = "login.html";  // Replace with your login page URL
    }
  });
}

const logoutButton = document.getElementById("logout-btn");

logoutButton.addEventListener("click", function() {
  firebase.auth().signOut()
    .then(() => {
      // Redirect to the login page after logging out
      window.location.href = "login.html"; // Adjust with your login page path
    })
    .catch((error) => {
      console.error("Error logging out: ", error);
    });
});
// Verify veterinarian
function verifyVet(vetId) {
  db.collection("users")
    .doc(vetId)
    .update({ isVerified: true })
    .then(() => {
      alert("Veterinarian verified!");
      fetchVets();  // Re-fetch the vets after verification
    })
    .catch((error) => {
      console.error("Error verifying veterinarian:", error);
    });
}

// Reject veterinarian
function rejectVet(vetId) {
  db.collection("users")
    .doc(vetId)
    .delete()
    .then(() => {
      alert("Veterinarian rejected and removed.");
      fetchVets();  // Re-fetch the vets after rejection
    })
    .catch((error) => {
      console.error("Error rejecting veterinarian:", error);
    });
}

document.addEventListener("DOMContentLoaded", function() {
  fetchVets();

  document.getElementById("vet-status").addEventListener("change", fetchVets);
});
