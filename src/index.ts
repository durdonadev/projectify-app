import express from 'express';
import cors from 'cors';
import { adminRouter, projectRouter, teamMemberRouter } from './routes';

import { GlobalError } from './middlewares';

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000;

app.use('/admins', adminRouter);
app.use('/projects', projectRouter);
app.use('/team-members', teamMemberRouter);
app.use(GlobalError.handle);

app.listen(PORT, () => {
    console.log('Server is running on ', PORT);
});
