import './SocialMedia.css'

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';

const appName = "AppName";
const initialUsers = [];
const initialProfilePics = [];


function App() {
    const [users, setUsers] = useState(initialUsers);
    const [currentUser, setCurrentUser] = useState(null);
    const [profilePics, setProfilePics] = useState(initialProfilePics);
    const [posts, setPosts] = useState([]);

    // Load logged-in user from localStorage
    useEffect(() => {
        const savedUser = JSON.parse(localStorage.getItem('currentUser'));
        if (savedUser) {
            setCurrentUser(savedUser);
        }
    }, []);

    const handleLogoff = () => {
        setCurrentUser(null);
        localStorage.removeItem('currentUser');
    };

    return (
        <Router>
                {appName}<sub>😎</sub>
            <nav>
                <Link to="/">Home</Link> | 
                {!currentUser && <Link to="/login">Login</Link>} 
                {currentUser && (
                    <>
                        | <Link to="/profile">Profile</Link> 
                        | <button onClick={handleLogoff}>Logoff</button>
                    </>
                )}
                | <Link to="/admin">Admin</Link> | <Link to="/create-user">Create User</Link>
            </nav>
            <Routes>
            <Route path="/" element={<HomePage posts={posts} currentUser={currentUser} setPosts={setPosts} />} />

                <Route path="/login" element={<LoginPage users={users} setCurrentUser={setCurrentUser} />} />
                <Route path="/profile" element={<UserProfile currentUser={currentUser} posts={posts} setPosts={setPosts} />} />
                <Route path="/admin" element={<AdminPage users={users} setUsers={setUsers} profilePics={profilePics} setProfilePics={setProfilePics} />} />
                <Route path="/create-user" element={<CreateUser users={users} setUsers={setUsers} profilePics={profilePics} />} />
            </Routes>
        </Router>
    );
}

function HomePage({ posts, currentUser, setPosts }) {
    const toggleLike = (postIndex) => {
        setPosts((prevPosts) => {
            const updatedPosts = [...prevPosts];
            const post = updatedPosts[postIndex];
            const userIndex = post.likes.indexOf(currentUser.username);
            if (userIndex === -1) {
                post.likes.push(currentUser.username); // Like the post
            } else {
                post.likes.splice(userIndex, 1); // Unlike the post
            }
            return updatedPosts;
        });
    };

    return (
        <div>
            <h1>Home</h1>
            {posts.length === 0 ? <p>No posts yet.</p> : null}
            {posts
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .map((post, index) => (
                    <div className='post' key={index}>
                        <img className='user_profile_image' src={post.user.profilePic} alt="Profile" width={50} />
                        <strong>{post.user.username}:</strong>
                        <p>{post.message}</p>
                        {post.image && <img className='post_image' src={post.image} alt="Post" width={100} />}
                        <br />
                        <button onClick={() => toggleLike(index)}>
                            {post.likes.includes(currentUser?.username) ? 'Unlike' : 'Like'}
                        </button>
                        <p>{post.likes.length} {post.likes.length === 1 ? 'like' : 'likes'}</p>
                    </div>
                ))}
        </div>
    );
}

function LoginPage({ users, setCurrentUser }) {
    const navigate = useNavigate();

    const handleLogin = (e) => {
        e.preventDefault();
        const username = e.target.username.value;
        const password = e.target.password.value;

        const user = users.find((u) => u.username === username && u.password === password);
            if (user) {
                setCurrentUser(user);
                localStorage.setItem('currentUser', JSON.stringify(user));
                navigate('/profile');
            } else {
                alert('Invalid user credentials');
            }
    };

    return (
        <div className='login'>
            <h1>Login</h1>
            <form onSubmit={handleLogin}>
                <input name="username" placeholder="Username" required />
                <input name="password" type="password" placeholder="Password" required />
                <button type="submit">Login</button>
            </form>
        </div>
    );
}


function UserProfile({ currentUser, posts, setPosts }) {
    if (!currentUser) {
        return <p>Please log in to view your profile.</p>;
    }

    const addPost = (e) => {
        
        e.preventDefault();
        const message = e.target.message.value;
        const imageFile = e.target.image.files[0];

        if (imageFile) {
            const reader = new FileReader();
            reader.onload = () => {
                setPosts([...posts, { user: currentUser, message, image: reader.result, date: new Date(), likes: [] }]);

            };
            reader.readAsDataURL(imageFile);
        } else {
            setPosts([...posts, { user: currentUser, message, image: null, date: new Date(), likes: []  }]);
        }
    };

    return (
        <div className='user'>
            <h1>{currentUser.username}'s Profile</h1>
            <form onSubmit={addPost}>
                <textarea name="message" placeholder="Write a post" required></textarea>
                <input name="image" type="file" accept="image/*" />
                <button type="submit">Post</button>
            </form>
            <h2>Your Posts</h2>
            {posts
                .filter((post) => post.user.username === currentUser.username)
                .map((post, index) => (
                    <div className='post' key={index}>
                        <p>{post.message}</p>
                        {post.image && <img src={post.image} alt="Post" width={100} />}
                        <br />
                        <button onClick={() => setPosts(posts.filter((_, i) => i !== index))}>Delete</button>
                    </div>
                ))}
        </div>
    );
}



function AdminPage({ users, setUsers, profilePics, setProfilePics }) {

    
    const deleteUser = (id) => {
        setUsers(users.filter((user) => user.id !== id));
    };

    const addProfilePic = (e) => {
        e.preventDefault();
        const imageFile = e.target.newPic.files[0];

        if (imageFile) {
            const reader = new FileReader();
            reader.onload = () => {
                setProfilePics([...profilePics, reader.result]);
            };
            reader.readAsDataURL(imageFile);
        }
    };
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const handleAdminLogin = (e) => {
        e.preventDefault();
        const username = e.target.username.value;
        const password = e.target.password.value;

        if (username === 'admin' && password === 'admin') {
            setIsAuthenticated(true);
        } else {
            alert('Invalid admin credentials');
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="admin-login">
                <h1>Admin Login</h1>
                <form onSubmit={handleAdminLogin}>
                    <input name="username" placeholder="Admin Username" required />
                    <input name="password" type="password" placeholder="Admin Password" required />
                    <button type="submit">Login</button>
                </form>
            </div>
        );
    }

    return (
        <div className="admin-section">
            <h1>Admin Panel</h1>
            <h2>Users</h2>
            <div className="user_list">
                {users.map((user) => (
                    <div key={user.id}>
                        <p>{user.username}</p>
                        <button onClick={() => deleteUser(user.id)}>Delete User</button>
                    </div>
                ))}
            </div>
            <hr />
            <h2>Manage Profile Pictures</h2>
            <form onSubmit={addProfilePic}>
                <input id="inputProfileImage" name="newPic" type="file" accept="image/*" required />
                <br />
                <button type="submit">Add Picture</button>
            </form>
            <div className="admin_profile_images">
                {profilePics.map((pic, index) => (
                    <div className="profile_choosed" key={index}>
                        <img src={pic} alt="Profile" width={50} />
                        <br />
                        <button onClick={() => setProfilePics(profilePics.filter((_, i) => i !== index))}>
                            Remove
                        </button>
                    </div>
                ))}
                <div className="profile_choosed" style={{ padding: '20px' }}>
                    <div style={{ backgroundColor: 'gray', height: '80%' }}>
                        <a href="#inputProfileImage">
                            <p>+</p>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}





function CreateUser({ users, setUsers, profilePics }) {
    const createUser = (e) => {
        e.preventDefault();
        const username = e.target.username.value;
        const profilePic = e.target.profilePic.value;
        const password = e.target.password.value;

        const newUser = {
            id: users.length + 1,
            username,
            password,
            profilePic,
            posts: []
        };
        setUsers([...users, newUser]);
        e.target.reset();
        alert('User created successfully!');
    };

    return (
        <div>
            <h1>Create User</h1>
            <form onSubmit={createUser}>
                <input name="username" placeholder="Username" required />
                <input name="password" type="password" placeholder="Password" required />
                <select name="profilePic" required>
                    {profilePics.map((pic, index) => (
                        <option key={index} value={pic}>{pic}</option>

                    ))}
                </select>
                <button type="submit">Create User</button>
            </form>
        </div>
    );
}


export default App;