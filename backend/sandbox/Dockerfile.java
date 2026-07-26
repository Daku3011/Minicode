FROM eclipse-temurin:21-jdk-alpine

RUN addgroup --system --gid 1000 sandbox && \
    adduser --system --uid 1000 --ingroup sandbox --shell /bin/sh --disabled-password sandbox

RUN mkdir -p /tmp/code /tmp/output && \
    chown -R sandbox:sandbox /tmp/code /tmp/output && \
    chmod 755 /tmp/code /tmp/output

USER sandbox
WORKDIR /tmp/code

# Entrypoint compiles and runs the mounted Main.java
ENTRYPOINT ["sh", "-c", "javac /tmp/code/Main.java && java -cp /tmp/code Main"]
