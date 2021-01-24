const { MTProto, getSRPParams } = require("@mtproto/core");
const { tempLocalStorage } = require("@mtproto/core/src/storage/temp");
const readline = require("readline");
require("dotenv").config();

const mtproto = new MTProto({
  api_id: process.env.API_ID,
  api_hash: process.env.API_HASH,
  customLocalStorage: tempLocalStorage,
});

const state = {
  phone: process.env.CLIENT_PHONE,
  phoneCodeHash: null,
  code: null,
  password: process.env.CLIENT_PASSWORD,
};

function sendCode(options) {
  console.log(`phone:`, state.phone);

  return mtproto
    .call(
      "auth.sendCode",
      {
        phone_number: state.phone,
        settings: {
          _: "codeSettings",
        },
      },
      options
    )
    .then((result) => {
      console.log(`result.phone_code_hash:`, result.phone_code_hash);
      state.phoneCodeHash = result.phone_code_hash;
      return result;
    });
}

function signIn(code, options) {
  state.code = code;
  console.log(`code:`, code);

  return mtproto.call(
    "auth.signIn",
    {
      phone_code: state.code,
      phone_number: state.phone,
      phone_code_hash: state.phoneCodeHash,
    },
    options
  );
}

function checkPassword(options) {
  const password = state.password;
  return mtproto
    .call("account.getPassword", {}, options)
    .then(async (result) => {
      const { srp_id, current_algo, secure_random, srp_B } = result;
      const { salt1, salt2, g, p } = current_algo;

      const { A, M1 } = await getSRPParams({
        g,
        p,
        salt1,
        salt2,
        gB: srp_B,
        password,
      });

      return mtproto.call(
        "auth.checkPassword",
        {
          password: {
            _: "inputCheckPasswordSRP",
            srp_id,
            A,
            M1,
          },
        },
        options
      );
    });
}

function getFullUser(options) {
  return mtproto.call(
    "users.getFullUser",
    {
      id: {
        _: "inputUserSelf",
      },
    },
    options
  );
}

function getMessages(access) {
  const params = {
    channel: {
      _: "inputChannel",
      channel_id: process.env.STORAGE,
      access_hash: access,
    },
    id: [485],
  };

  return mtproto.call("channels.getMessages", params);
}

function prompt(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve, reject) => {
    rl.question(question, (input) => {
      rl.close();

      resolve(input);
    });
  });
}

async function authenticate() {
  await getFullUser()
    .then((result) => {
      console.log(`result:`, result);
      process.exit();
    })
    .catch((error) => {
      console.log(`error:`, error);
      return sendCode(state.phone);
    })
    .catch((error) => {
      console.log(`sendCode[error]:`, error);

      if (error.error_message.includes("_MIGRATE_")) {
        const [type, nextDcId] = error.error_message.split("_MIGRATE_");

        mtproto.setDefaultDc(+nextDcId);

        return sendCode(state.phone);
      }
    })
    .then(async () => {
      const code = await prompt("code: ");
      return signIn(code);
    })
    .catch((error) => {
      console.log(`signIn[error]:`, error);

      if (error.error_message === "SESSION_PASSWORD_NEEDED") {
        return checkPassword(state.password);
      }
    })
    .catch((e) => console.log(e.message));
}

async function getFullChannel(channelId) {
  await mtproto
    .call("messages.getDialogs", {
      limit: 100,
      offset_peer: {
        _: "inputPeerEmpty",
      },
    })
    .then(async (result) => {
      const storage = result.chats.find((x) => x.id === Number(channelId));

      return await mtproto.call("channels.getFullChannel", {
        channel: {
          _: "inputPeerChannel",
          channel_id: Number(channelId),
          access_hash: storage.access_hash,
        },
      });
    })
    .catch((e) => console.log(e));
}

async function getChannelMessages(channelId, messages) {
  await mtproto
    .call("messages.getDialogs", {
      limit: 100,
      offset_peer: {
        _: "inputPeerEmpty",
      },
    })
    .then((result) => result.chats.find((x) => x.id === Number(channelId)))
    .then(async (storage) => {
      return await mtproto.call("channels.getMessages", {
        channel: {
          _: "inputPeerChannel",
          channel_id: Number(channelId),
          access_hash: storage.access_hash,
        },
        id: [...messages],
      });
    })
    .catch((e) => console.log(e));
}

module.exports = {
  mtproto,
  authenticate,
  getChannelMessages,
  getFullChannel,
};
