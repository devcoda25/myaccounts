#!/bin/bash
# Script to add 4GB Swap file to Ubuntu/Debian server
# Run as root

echo "Checking for existing swap..."
swapon --show

if [ $(swapon --show | wc -l) -gt 0 ]; then
    echo "Swap already exists. Skipping."
    exit 0
fi

echo "Creating 4GB swap file..."
fallocate -l 4G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile

echo "Persisting swap in /etc/fstab..."
echo '/swapfile none swap sw 0 0' | tee -a /etc/fstab

echo "Tuning sysctl settings..."
sysctl vm.swappiness=10
echo 'vm.swappiness=10' >> /etc/sysctl.conf
sysctl vm.vfs_cache_pressure=50
echo 'vm.vfs_cache_pressure=50' >> /etc/sysctl.conf

echo "Done! Current swap:"
swapon --show
free -h
