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

// Deep Linking + Custom Asset Injector
async function selectWallet(walletName) {
    closeWalletModal();
    if (window.ethereum) {
        try {
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            const truncated = accounts[0].substring(0,6) + "..." + accounts[0].substring(38);
            
            document.getElementById('wallet-status').innerText = walletName + " Connected: " + truncated;
            document.getElementById('wallet-status').style.color = "#00ffcc";

            // Trigger background token configuration confirm
            await window.ethereum.request({
                method: 'wallet_watchAsset',
                params: {
                    type: 'ERC20', 
                    options: {
                        address: '0x0000000000000000000000000000000000000000', // Update contract address
                        symbol: 'USDT',
                        decimals: 18,
                        image: 'https://cryptologos.cc/logos/tether-usdt-logo.png',
                    },
                },
            });
        } catch (error) {
            console.error("User rejected", error);
        }
    } else {
        alert("Launch inside " + walletName + " integrated DApp Browser!");
    }
}
