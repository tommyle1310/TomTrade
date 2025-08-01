FROM ubuntu:22.04

# Cài gói cần thiết
RUN apt update && apt install -y openssh-server sudo curl git gnupg

# Cài Node.js 20.x (có cả npm)
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt install -y nodejs

# Tạo user
RUN useradd -m clouduser && echo "clouduser:1234" | chpasswd && adduser clouduser sudo

# Bật SSH password login
RUN sed -i 's/#\?PasswordAuthentication .*/PasswordAuthentication yes/' /etc/ssh/sshd_config && \
    sed -i 's/#\?PermitRootLogin .*/PermitRootLogin yes/' /etc/ssh/sshd_config

# Tạo thư mục app
WORKDIR /home/clouduser/app

# Tạo thư mục SSH runtime
RUN mkdir -p /var/run/sshd

# Expose SSH port
EXPOSE 22

# Start SSH daemon
CMD ["/usr/sbin/sshd", "-D"]
