const express = require ("express");
const mongoose = require("mongoose");
const userRouter = require("./routers/userRouter");
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true}));

mongoose.connect(process.env.MONGODB_URL || 'mongodb://localhost/task', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
});

app.get('/', (req,res) => {
    res.send('server is ready');
});
app.use('/api/users', userRouter);

app.listen(8000, () => {
    console.log('server at http://localhost:8000')
});