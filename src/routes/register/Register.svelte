<script lang="ts">
    import { register } from '../../api/ToAuthController';
	import { saveEmployee } from '../../api/ToEmployeeController';
	import { saveLocation } from '../../api/ToLocationController';
	import { saveOrganization } from '../../api/ToOrganizationController';
  

    // wizard state
    let step = 1;
    let error: string | null = null;
    let loading = false;

    // Step 1: Organization (with address)
    let orgName = '';
    let street = '';
    let postalCode = '';
    let city = '';

    // Step 2: Person
    let firstName = '';
    let lastName = '';
    let email = '';
    let birthDate = '';
    let phone = '';

    // Step 3: User
    let username = '';
    let password = '';
    let confirm = '';

    // created ids
    let orgId: number | null = null;
    let locationId: number | null = null;
    let employeeId: number | null = null;

    function next() {
        error = null;
        if (step === 1) {
            if (!orgName || !street || !postalCode || !city) { error = 'Uzupełnij dane organizacji i adresu'; return; }
        }
        if (step === 2) {
            if (!firstName || !lastName || !email || !birthDate) { error = 'Uzupełnij dane osoby'; return; }
            if (!/^\d{9}$/.test(phone || '')) { error = 'Telefon musi mieć 9 cyfr'; return; }
        }
        step = Math.min(3, step + 1);
        if (step === 3 && !username) username = email;
    }

    function back() {
        error = null;
        step = Math.max(1, step - 1);
    }

    async function handleSubmit(event: Event) {
        event.preventDefault();
        error = null;
        if (!username) username = email;
        if (password !== confirm) { error = 'Hasła nie są takie same'; return; }
        loading = true;
        try {
            // 1) Organization
            const org = await saveOrganization({ name: orgName });
            orgId = org?.id;

            // 2) Location
            const loc = await saveLocation({
                street,
                postalCode,
                city,
                organization: { id: orgId }
            });
            locationId = loc?.id;

            // 3) Employee
            const emp = await saveEmployee({
                firstName,
                lastName,
                email,
                telephone: phone,
                location: { id: locationId }
            });
            employeeId = emp?.id;

            // 4) User registration
            const userPayload: any = {
                role: 'USER',
                login: username,
                password,
                location: { id: locationId },
                employee: { id: employeeId }
            };
            await register(userPayload);
            alert(`Konto użytkownika ${username} zostało pomyślnie utworzone.`);
            window.location.href = '/login';
        } catch (e: any) {
            error = e?.message || 'Rejestracja nie powiodła się';
        } finally {
            loading = false;
        }
    }
</script>

<div class="register-wrap">
    <a href="/" aria-label="Powrót na stronę główną">
        <img src="/logo.png" alt="EduPlanner" class="logo-top" />
    </a>
    <h1>Załóż konto</h1>

    <div class="steps">
        <span class:active={step===1}>1</span>
        <span class:active={step===2}>2</span>
        <span class:active={step===3}>3</span>
    </div>

    {#if step === 1}
        <div class="card">
            <h2>Krok 1: Organizacja</h2>
            <form class="form-grid">
                <label for="orgName">Nazwa organizacji</label>
                <input id="orgName" type="text" bind:value={orgName} />

                <label for="street">Ulica</label>
                <input id="street" type="text" bind:value={street} />

                <label for="postal">Kod pocztowy</label>
                <input id="postal" type="text" bind:value={postalCode} />

                <label for="city">Miasto</label>
                <input id="city" type="text" bind:value={city} />
            </form>

            {#if error}<p class="error">{error}</p>{/if}
            <div class="nav">
                <button type="button" on:click={next}>Dalej</button>
            </div>
        </div>
    {:else if step === 2}
        <div class="card">
            <h2>Krok 2: Dane osoby</h2>
            <form class="form-grid">
                <label for="firstName">Imię</label>
                <input id="firstName" type="text" bind:value={firstName} />

                <label for="lastName">Nazwisko</label>
                <input id="lastName" type="text" bind:value={lastName} />

                <label for="email">E-mail</label>
                <input id="email" type="email" bind:value={email} />

                <label for="birth">Data urodzenia</label>
                <input id="birth" type="date" bind:value={birthDate} />

                <label for="phone">Numer telefonu (9 cyfr)</label>
                <input id="phone" type="tel" inputmode="numeric" pattern="\d{9}" bind:value={phone} />
            </form>

            {#if error}<p class="error">{error}</p>{/if}
            <div class="nav">
                <button type="button" on:click={back}>Wstecz</button>
                <button type="button" on:click={next}>Dalej</button>
            </div>
        </div>
    {:else if step === 3}
    <!-- TODO: add captcha -->
        <div class="card">
            <h2>Krok 3: Użytkownik</h2>
            <form class="form-grid" on:submit|preventDefault={handleSubmit}>
                <label for="username">Nazwa użytkownika</label>
                <input id="username" type="email" bind:value={username} disabled />

                <label for="password">Hasło</label>
                <input id="password" type="password" bind:value={password} />

                <label for="confirm">Powtórz hasło</label>
                <input id="confirm" type="password" bind:value={confirm} />

                {#if error}<p class="error">{error}</p>{/if}
                <div class="nav">
                    <button type="button" on:click={back}>Wstecz</button>
                    <button type="submit" disabled={loading}>{loading ? 'Tworzenie…' : 'Utwórz konto'}</button>
                </div>
            </form>
        </div>
    {/if}
</div>

<style>
    .register-wrap { max-width: 620px; margin: 64px auto; padding: 24px; display: flex; flex-direction: column; align-items: center; }
    .logo-top { height: 40px; width: auto; margin-bottom: 12px; }
    h1 { color: #344B66; margin-bottom: 16px; }
    form { display: grid; gap: 12px; }
    .form-grid { grid-template-columns: 1fr 2fr; align-items: center; }
    label { color: #344B66; font-weight: 600; }
    input { background: #fff; color: #344B66; border: none; border-bottom: 2px solid #D62B21; padding: 10px 12px; }
    input:focus { outline: none; border-bottom-color: #D62B21; }
    .error { color: #ef4444; }
    button { background: #D62B21; color: #fff; border: none; border-radius: 10px; padding: 12px 18px; font-weight: 700; cursor: pointer; }
    button:hover { background: #D62B21; }

    .steps { display: flex; gap: 8px; margin-bottom: 16px; }
    .steps span { width: 28px; height: 28px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; background: #e5e7eb; color: #344B66; font-weight: 700; }
    .steps span.active { background: #D62B21; color: #fff; }

    .card { width: 100%; background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 16px; }
    .card h2 { color: #344B66; margin-top: 0; }
    .nav { display: flex; gap: 8px; justify-content: flex-end; margin-top: 12px; }
    select { padding: 8px 10px; border: 1px solid #cbd5e1; border-radius: 6px; color: #344B66; }
</style>


