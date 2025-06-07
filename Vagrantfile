Vagrant.configure("2") do |config|
  # Box and OS version
  config.vm.box = "ubuntu/jammy64"  # Ubuntu 22.04

  # Hostname and networking
  config.vm.hostname = "skyflyers.es"
  config.vm.network "private_network", ip: "192.168.56.10"
  config.vm.network "public_network"

  # Provisioning script
  config.vm.provision "shell", inline: <<-SHELL
    # Update package lists and install prerequisites
    sudo apt-get update
    sudo apt-get install -y software-properties-common lsb-release ca-certificates apt-transport-https

    # Add PHP 8.2 repository
    sudo add-apt-repository ppa:ondrej/php -y
    sudo apt-get update

    # Install PostgreSQL server and contrib packages
    sudo apt-get install -y postgresql postgresql-contrib

    # Install PHP 8.2, Apache, and necessary PHP extensions
    sudo apt-get install -y \
      apache2 libapache2-mod-php8.2 php8.2 php8.2-cli php8.2-common \
      php8.2-mbstring php8.2-xml php8.2-curl php8.2-bcmath php8.2-zip \
      php8.2-mysql php8.2-pgsql unzip curl

    # Enable Apache modules and disable default site
    sudo a2enmod rewrite
    sudo a2dissite 000-default.conf
    sudo systemctl restart apache2

    # Configure PostgreSQL user and database
    sudo -u postgres psql -c "CREATE USER SkyFlyers WITH PASSWORD '1234';"
    sudo -u postgres psql -c "CREATE DATABASE \"SkyFlyers\" OWNER SkyFlyers;"

    # Set up project directory and permissions
    sudo rm -rf /var/www/skyflyers
    sudo ln -fs /vagrant /var/www/skyflyers
    sudo chmod -R 777 /var/www/skyflyers

    # Configure Apache VirtualHost
    cat <<EOF | sudo tee /etc/apache2/sites-available/skyflyers.conf
<VirtualHost *:80>
  ServerName skyflyers.local
  DocumentRoot /var/www/skyflyers/public
  <Directory /var/www/skyflyers/public>
    AllowOverride All
    Require all granted
    Options Indexes FollowSymLinks
  </Directory>
</VirtualHost>
EOF

    sudo a2ensite skyflyers.conf
    sudo systemctl reload apache2

    # Install Composer
    curl -sS https://getcomposer.org/installer | php
    sudo mv composer.phar /usr/local/bin/composer

    # Install Node.js (LTS 22.x)
    curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
    sudo apt-get install -y nodejs
  SHELL

  # Synced folder configuration with full 777 permissions
  config.vm.synced_folder ".", "/vagrant",
    owner: "vagrant",
    group: "vagrant",
    mount_options: ["dmode=777", "fmode=777"]
end
