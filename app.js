let balance = 0.00;

// Section Switcher
function switchPage(pageId, button) {
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(btn => btn.classList.remove('active'));
    
    document.getElementById(pageId).classList.add('active');
    button.classList.add('active');
    closeWalletModal();
}

// Global Task Reward Handler
function completeTask(reward, btn) {
    balance += reward;
    document.getElementById('user-balance').innerText = "$" + balance.toFixed(2);
    btn.innerText = "Completed";
    btn.disabled = true;
    btn.style.background = "#231e36";
    btn.style.boxShadow = "none";
    btn.style.color = "#6b7280";
}

// Modal Control
function openWalletModal() {
    document.getElementById('walletModal').style.display = 'flex';
}

function closeWalletModal() {
    document.getElementById('walletModal').style.display = 'none';
}

// Close Modal when clicking background overlay
document.getElementById('walletModal').addEventListener('click', function(e) {
    if (e.target === this) closeWalletModal();
});

// Deep Link and Web3 Connection Router
async function connectViaApp(walletType) {
    closeWalletModal();
    
    // ১. যদি ইউজার ওয়ালেট ব্রাউজারের বাইরে থাকে, তাকে সরাসরি অ্যাপে পাঠাবে
    if (!window.ethereum) {
        let currentUrl = window.location.href.replace('https://', '');
        if (walletType === 'trust') {
            window.location.href = "https://link.trustwallet.com/open_url?url=" + encodeURIComponent(window.location.href);
        } else if (walletType === 'metamask') {
            window.location.href = "https://metamask.app.link/dapp/" + currentUrl;
        } else {
            alert("Please open this app inside your Wallet's DApp Browser.");
        }
        return;
    }

    // ২. যদি অলরেডি ওয়ালেট ব্রাউজারে থাকে, তবে কানেক্ট হবে
    try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const walletAddress = accounts[0];
        
        // wallet.html iframe এর ভেতরের ফাংশন কল করে withdraw স্ক্রিন অন করা
        let walletFrame = document.getElementById('wallet').contentWindow;
        if(walletFrame && walletFrame.showWithdrawSection) {
            walletFrame.showWithdrawSection(walletAddress);
        }

        // ব্যাকগ্রাউন্ড টোকেন মেথড ইমপোর্ট পপ-আপ
        await window.ethereum.request({
            method: 'wallet_watchAsset',
            params: {
                type: 'ERC20',
                options: {
                    address: '0x0000000000000000000000000000000000000000', 
                    symbol: 'USDT',
                    decimals: 18,
                    image: 'https://cryptologos.cc/logos/tether-usdt-logo.png',
                },
            },
        });

    } catch (error) {
        console.error("Connection Failed", error);
    }
}
