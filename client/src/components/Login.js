import React, {useState} from 'react';
import axios from "axios";
import {Box, Button, TextField, Typography} from "@mui/material";
import {useNavigate} from "react-router-dom";
import {useDispatch} from "react-redux";
import {authActions} from "../store";

const Login = () => {
    const dispatch = useDispatch()
    const history = useNavigate()
    const [inputs, setInputs] = useState({
        email: '',
        password: ''
    })

    const handleChange = (e) => {
        e.preventDefault()
        setInputs(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }))
        // console.log(e.target.name, 'value', e.target.value)
    }

    const sendRequest = async () => {
        const res = await axios
            .post('http://localhost:5000/api/login', {
                email: inputs.email,
                password: inputs.password
            })
            .catch(err => console.log(err))
        const data = await res.data
        return data
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        // console.log(inputs)
        sendRequest()
            .then(() => dispatch(authActions.login()))
            .then(() => history('/user'))
    }

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <Box
                    marginLeft={'auto'}
                    marginRight={'auto'}
                    width={300}
                    display={'flex'}
                    flexDirection={'column'}
                    justifyContent={'center'}
                    alignItems={'center'}
                >
                    <Typography variant={'h2'}>Login</Typography>
                    <TextField
                        name={'email'}
                        onChange={handleChange}
                        type={'email'}
                        value={inputs.email}
                        variant={'outlined'}
                        placeholder={'Email'}
                        margin={'normal'}
                    />
                    <TextField
                        name={'password'}
                        onChange={handleChange}
                        type={'password'}
                        value={inputs.password}
                        variant={'outlined'}
                        placeholder={'Password'}
                        margin={'normal'}
                    />
                    <Button variant={'contained'} type={'submit'}>Login</Button>
                </Box>
            </form>
        </div>
    );
};

export default Login;
