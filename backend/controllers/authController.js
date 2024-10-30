const registerUser = (db) => async (req, res) => {
    try {
        console.log(req.body);
        const userJson = {
            email: req.body.email,
            password: req.body.password
        };
        console.log(userJson.email);
        const usersRef = await db.collection("users").get();
        usersRef.forEach(doc => {
            const currentElement = doc.data();
            if (currentElement.email === userJson.email) {
                console.log('found');
            }
        })
        const response = await db.collection("users").add(userJson);
        res.send(response);
    } catch (error) {
        res.send(error);
    }
};

const loginUser = (db) => async (req, res) => {
    try {
        const { email, password } = req.body; // Access email and password from the request body

        // Query to find a user with the matching email
        const usersRef = db.collection("users");
        const query = usersRef.where("email", "==", email).where("password", "==", password);
        const querySnapshot = await query.get();

        // Check if a matching document exists
        if (querySnapshot.empty) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        // Assuming only one user should match the email/password combination
        let user;
        querySnapshot.forEach((doc) => {
            user = { _id: doc.id, ...doc.data() }; // Retrieve user data and document ID
        });

        // Respond with the user's data
        res.status(200).json(user);
    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).json({ message: "An error occurred during login" });
    }
};

//toDo - updateUser

const deleteUser = (db) => async (req, res) => {
    try {
        const response = await db.collection("users").doc(req.params.id).delete(); //it is req.params.id because it is passed from the url itself
        res.send(response)
    } catch (error) {
        res.send(error)
    }
}

module.exports = {
    registerUser,
    loginUser,
    deleteUser
};
