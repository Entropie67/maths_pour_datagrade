FROM registry.gitlab.com/islandoftex/images/texlive:latest

# Mettre à jour les paquets et installer les outils nécessaires
RUN apt-get update && apt-get install -y \
    wget \
    ca-certificates \
    gnupg \
    xz-utils \
    && rm -rf /var/lib/apt/lists/*

# === Node.js 22.13.0 ===
ENV NODE_VERSION=22.13.0
RUN wget -O /tmp/node-v${NODE_VERSION}-linux-x64.tar.xz https://nodejs.org/dist/v${NODE_VERSION}/node-v${NODE_VERSION}-linux-x64.tar.xz && \
    tar -xJf /tmp/node-v${NODE_VERSION}-linux-x64.tar.xz -C /usr/local --strip-components=1 && \
    rm /tmp/node-v${NODE_VERSION}-linux-x64.tar.xz
    # Après avoir installé node
RUN npm install -g npm@latest

# === Installer les paquets LaTeX nécessaires pour lualatex ===
# Remplacer lmodern par newtx (meilleur choix pour lualatex moderne)
# RUN tlmgr install newtx
# RUN tlmgr update --self

# === Nettoyer l’image ===
RUN apt-get clean && rm -rf /var/lib/apt/lists/*

# === Vérifier les installations ===
# RUN node --version
# RUN lualatex --version
