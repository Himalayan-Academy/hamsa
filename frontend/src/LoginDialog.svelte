<script>
  import { login, loggedIn } from "./api.js";
  import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

  let email;
  let password;
  let error = false;

  const savedCredentials = () => {
    if (
      sessionStorage.getItem("email") !== null &&
      sessionStorage.getItem("password") !== null
    ) {
      email = sessionStorage.getItem("email");
      password = sessionStorage.getItem("password");
      return true;
    } else {
      return false;
    }
  };

const logout = async () => {
    sessionStorage.removeItem("email");
    sessionStorage.removeItem("password");
    $loggedIn = false;
    dispatch('loggedOut');
}

  const testAndSaveLogin = async () => {
    if (await login(email, password)) {
      console.log(`user ${email} logged in.`);
      sessionStorage.setItem("email", email);
      sessionStorage.setItem("password", password);
      error = false;
      $loggedIn = true;
      dispatch('loggedIn', email);
    } else {
      console.log(`Bad login credentials.`);
      sessionStorage.removeItem("email");
      sessionStorage.removeItem("password");
      error = "Not a valid user.";
      $loggedIn = false;
    }
  };

  $loggedIn = savedCredentials();
</script>

<style>
  .login-dialog-wrapper {
    position: absolute;
    top: 0px;
    left: 0px;
    height: 100vh;
    width: 100vw;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 99999;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .login-dialog {
    opacity: 1;
    background-color: #f4f3f1;
    width: 300px;
    height: 300px;
    display: flex;
  }

  .login-dialog form {
    margin: auto;
    color: black;
    display: inline-block;
  }

  .error {
      font-weight: bold;
      color: darkred;
  }
</style>

<div class="login-dialog-wrapper">
  <div class="login-dialog" on:click|stopPropagation={()=>{}}>
    <form on:submit|preventDefault={testAndSaveLogin}>
      {#if !$loggedIn}
      <h1>Login</h1>
      {#if error}
      <p class="error">{error}
      {/if}
      <label for="email">Email:</label>
      <input type="text" id="email" bind:value={email} />
      <label for="password">Password:</label>
      <input type="password" id="password" bind:value={password} />
      <br />
      <input type="submit" value="log in" />
      {:else}
            <button on:click={logout}>log out</button>
      {/if}
    </form>
  </div>
</div>
