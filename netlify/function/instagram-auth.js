const axios = require('axios');
require('dotenv').config();

exports.handler = async function (event, context) {
    console.log("Function invoked");
    console.log("HTTP Method: ", event.httpMethod);

    // HTTP���\�b�h�̃`�F�b�N
    if (event.httpMethod !== "POST") {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: "Method Not Allowed" }),
        };
    }

    const { code } = JSON.parse(event.body);

    if (!code) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: "�F�؃R�[�h������܂���B" }),
        };
    }

    const clientId = process.env.INSTAGRAM_CLIENT_ID;
    const clientSecret = process.env.INSTAGRAM_CLIENT_SECRET;
    const redirectUri = process.env.INSTAGRAM_REDIRECT_URI;
    console.log("Client ID: ", clientId);
    console.log("Client Secret: ", clientSecret);
    console.log("Redirect URI: ", redirectUri);
    const tokenUrl = 'https://api.instagram.com/oauth/access_token';
    const profileUrl = 'https://graph.instagram.com/me';

    const params = new URLSearchParams();
    params.append('client_id', clientId);
    params.append('client_secret', clientSecret);
    params.append('grant_type', 'authorization_code');
    params.append('redirect_uri', redirectUri);
    params.append('code', code);

    try {
        // �A�N�Z�X�g�[�N�����擾
        const tokenResponse = await axios.post(tokenUrl, params);
        console.log("Token Response: ", tokenResponse.data);
        const accessToken = tokenResponse.data.access_token;

        // ���[�U�[�v���t�B�[�����擾
        const profileResponse = await axios.get(`${profileUrl}?fields=id,username&access_token=${accessToken}`);
        console.log("Profile Response: ", profileResponse.data);
        const userProfile = profileResponse.data;

        // �A�N�Z�X�g�[�N���ƃ��[�U�[�v���t�B�[����Ԃ�
        return {
            statusCode: 200,
            body: JSON.stringify({
                AccessToken: accessToken,
                UserProfile: userProfile,
            }),
        };
    } catch (error) {
        console.error("Error fetching access token: ", error.response ? error.response.data : error.message); // �G���[�����O�ɏo��
        return {
            statusCode: 500,
            body: JSON.stringify({
                error: "�A�N�Z�X�g�[�N���̎擾�Ɏ��s���܂����B",
                details: error.response ? error.response.data : error.message,
            }),
        };
    }
};